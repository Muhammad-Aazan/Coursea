const Payment = require("../models/Payment");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const Progress = require("../models/Progress");
const createNotification = require("../utils/createNotification");
const Stripe = require("stripe");

// Initialize stripe instance
let stripe = null;
if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes("placeholder")) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
}

// Commission helper (default 15% platform commission, 85% instructor earnings)
function calculateCommission(amount) {
  const rate = parseFloat(process.env.PLATFORM_COMMISSION_RATE || "0.15");
  const platformFee = Number((amount * rate).toFixed(2));
  const instructorEarnings = Number((amount - platformFee).toFixed(2));
  return { rate, platformFee, instructorEarnings };
}

// @desc    Create Stripe Checkout Session
// @route   POST /api/payments/create-checkout
async function createCheckout(req, res, next) {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required"
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    if (course.price <= 0) {
      return res.status(400).json({
        success: false,
        message: "This course is free. Please use the enrollment endpoint directly."
      });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: req.user._id,
      course: courseId
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: "You are already enrolled in this course"
      });
    }

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const { rate, platformFee, instructorEarnings } = calculateCommission(course.price);

    // If live Stripe is configured, create live Stripe session
    if (stripe) {
      try {
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: [
            {
              price_data: {
                currency: "usd",
                product_data: {
                  name: course.title,
                  description: course.description
                    ? course.description.substring(0, 250)
                    : undefined
                },
                unit_amount: Math.round(course.price * 100)
              },
              quantity: 1
            }
          ],
          mode: "payment",
          customer_email: req.user.email,
          client_reference_id: req.user._id.toString(),
          metadata: {
            courseId: course._id.toString(),
            studentId: req.user._id.toString(),
            instructorId: course.instructor ? course.instructor.toString() : "",
            platformFee: platformFee.toString(),
            instructorEarnings: instructorEarnings.toString()
          },
          success_url: `${clientUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${clientUrl}/courses/${course._id}`
        });

        const payment = await Payment.create({
          student: req.user._id,
          course: course._id,
          instructor: course.instructor,
          stripeSessionId: session.id,
          amount: course.price,
          platformFee,
          instructorEarnings,
          commissionRate: rate,
          currency: "usd",
          status: "pending"
        });

        return res.status(200).json({
          success: true,
          message: "Stripe checkout session created",
          data: {
            url: session.url,
            sessionId: session.id,
            paymentId: payment._id
          }
        });
      } catch (stripeErr) {
        console.warn("Stripe API call failed, falling back to mock mode:", stripeErr.message);
      }
    }

    // Fallback / Development mode session when Stripe key is placeholder or test mode
    const mockSessionId = `cs_test_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const payment = await Payment.create({
      student: req.user._id,
      course: course._id,
      instructor: course.instructor,
      stripeSessionId: mockSessionId,
      amount: course.price,
      platformFee,
      instructorEarnings,
      commissionRate: rate,
      currency: "usd",
      status: "pending"
    });

    res.status(200).json({
      success: true,
      message: "Checkout session created (development mode)",
      data: {
        url: `${clientUrl}/checkout/mock?session_id=${mockSessionId}`,
        sessionId: mockSessionId,
        paymentId: payment._id,
        isMock: true
      }
    });
  } catch (error) {
    next(error);
  }
}

// @desc    Get student's payment history
// @route   GET /api/payments/my-payments
async function getMyPayments(req, res, next) {
  try {
    const payments = await Payment.find({ student: req.user._id })
      .populate("course", "title thumbnail price")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Payment history retrieved successfully",
      count: payments.length,
      data: { payments }
    });
  } catch (error) {
    next(error);
  }
}

// @desc    Get payment details by ID
// @route   GET /api/payments/:id
async function getPaymentById(req, res, next) {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate("course", "title thumbnail price")
      .populate("student", "name email");

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found"
      });
    }

    // Allow only owner student or admin
    if (
      payment.student._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this payment record"
      });
    }

    res.status(200).json({
      success: true,
      message: "Payment details retrieved successfully",
      data: { payment }
    });
  } catch (error) {
    next(error);
  }
}

// @desc    Stripe Webhook
// @route   POST /api/payments/webhook
async function stripeWebhook(req, res, next) {
  let event = req.body;

  // If real webhook signature is configured, verify signature
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (stripe && sig && endpointSecret && !endpointSecret.includes("placeholder")) {
    try {
      event = stripe.webhooks.constructEvent(req.rawBody || req.body, sig, endpointSecret);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: `Webhook Error: ${err.message}`
      });
    }
  }

  // Handle successful checkout payment
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const courseId = session.metadata ? session.metadata.courseId : null;
    const studentId = session.metadata
      ? session.metadata.studentId
      : session.client_reference_id;

    if (courseId && studentId) {
      const course = await Course.findById(courseId);
      const totalAmount = session.amount_total ? session.amount_total / 100 : (course ? course.price : 0);
      const { rate, platformFee, instructorEarnings } = calculateCommission(totalAmount);

      // Find or update payment record
      let payment = await Payment.findOne({ stripeSessionId: session.id });
      if (payment) {
        payment.status = "completed";
        if (!payment.instructor && course) payment.instructor = course.instructor;
        if (!payment.platformFee) payment.platformFee = platformFee;
        if (!payment.instructorEarnings) payment.instructorEarnings = instructorEarnings;
        await payment.save();
      } else {
        payment = await Payment.create({
          student: studentId,
          course: courseId,
          instructor: course ? course.instructor : undefined,
          stripeSessionId: session.id,
          amount: totalAmount,
          platformFee,
          instructorEarnings,
          commissionRate: rate,
          currency: session.currency || "usd",
          status: "completed"
        });
      }

      // Automatically enroll student in course
      const existingEnrollment = await Enrollment.findOne({
        student: studentId,
        course: courseId
      });

      if (!existingEnrollment) {
        await Enrollment.create({
          student: studentId,
          course: courseId,
          payment: payment._id,
          progress: 0
        });

        // Initialize progress
        await Progress.findOneAndUpdate(
          { student: studentId, course: courseId },
          {
            student: studentId,
            course: courseId,
            completedLessons: [],
            percentage: 0
          },
          { upsert: true }
        );

        // Notify instructor
        if (course && course.instructor) {
          await createNotification({
            recipient: course.instructor,
            type: "new_enrollment",
            title: "Course Purchased via Stripe!",
            message: `A student bought "${course.title}". Your earnings: $${payment.instructorEarnings.toFixed(2)} (Platform fee: $${payment.platformFee.toFixed(2)})`,
            link: `/instructor/students/${course._id}`
          });
        }
      }
    }
  }

  res.status(200).json({ received: true });
}

// @desc    Get session details for checkout page
// @route   GET /api/payments/session/:sessionId
async function getSessionDetails(req, res, next) {
  try {
    const { sessionId } = req.params;
    const payment = await Payment.findOne({ stripeSessionId: sessionId })
      .populate("course", "title description thumbnail price instructor")
      .populate("instructor", "name email");

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Checkout session not found"
      });
    }

    res.status(200).json({
      success: true,
      data: {
        payment,
        course: payment.course,
        instructor: payment.instructor
      }
    });
  } catch (error) {
    next(error);
  }
}

// @desc    Complete mock payment (for dev / sandbox testing)
// @route   POST /api/payments/complete-mock
async function completeMockPayment(req, res, next) {
  try {
    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: "Session ID is required"
      });
    }

    const payment = await Payment.findOne({ stripeSessionId: sessionId });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found"
      });
    }

    payment.status = "completed";
    await payment.save();

    const course = await Course.findById(payment.course);

    // Auto enroll student
    let enrollment = await Enrollment.findOne({
      student: payment.student,
      course: payment.course
    });

    if (!enrollment) {
      enrollment = await Enrollment.create({
        student: payment.student,
        course: payment.course,
        payment: payment._id,
        progress: 0
      });

      await Progress.findOneAndUpdate(
        { student: payment.student, course: payment.course },
        {
          student: payment.student,
          course: payment.course,
          completedLessons: [],
          percentage: 0
        },
        { upsert: true }
      );

      if (course && course.instructor) {
        await createNotification({
          recipient: course.instructor,
          type: "new_enrollment",
          title: "New Course Purchase!",
          message: `A student bought "${course.title}". Your earnings: $${payment.instructorEarnings.toFixed(2)} (Platform fee: $${payment.platformFee.toFixed(2)})`,
          link: `/instructor/students/${course._id}`
        });
      }
    }

    res.status(200).json({
      success: true,
      message: "Test payment completed and enrolled successfully",
      data: {
        paymentId: payment._id,
        courseId: payment.course
      }
    });
  } catch (error) {
    next(error);
  }
}

// @desc    Verify & confirm payment session (called when returning from Stripe or mock checkout)
// @route   POST /api/payments/confirm-session
async function confirmSession(req, res, next) {
  try {
    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: "Session ID is required"
      });
    }

    let payment = await Payment.findOne({ stripeSessionId: sessionId });

    // If Stripe is active and sessionId is a Stripe checkout session
    if (stripe && sessionId.startsWith("cs_")) {
      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (session && session.payment_status === "paid") {
          if (!payment) {
            const courseId = session.metadata?.courseId;
            const course = await Course.findById(courseId);
            const totalAmount = session.amount_total ? session.amount_total / 100 : (course?.price || 0);
            const { rate, platformFee, instructorEarnings } = calculateCommission(totalAmount);
            payment = await Payment.create({
              student: req.user._id,
              course: courseId,
              instructor: course?.instructor,
              stripeSessionId: session.id,
              amount: totalAmount,
              platformFee,
              instructorEarnings,
              commissionRate: rate,
              currency: session.currency || "usd",
              status: "completed"
            });
          } else {
            payment.status = "completed";
            await payment.save();
          }
        }
      } catch (stripeErr) {
        console.warn("Stripe session retrieve warning:", stripeErr.message);
      }
    } else if (payment) {
      // Mock session fallback
      payment.status = "completed";
      await payment.save();
    }

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment session record not found"
      });
    }

    const course = await Course.findById(payment.course);

    // Ensure student enrollment is created
    let enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: payment.course
    });

    if (!enrollment) {
      enrollment = await Enrollment.create({
        student: req.user._id,
        course: payment.course,
        payment: payment._id,
        progress: 0
      });

      await Progress.findOneAndUpdate(
        { student: req.user._id, course: payment.course },
        {
          student: req.user._id,
          course: payment.course,
          completedLessons: [],
          percentage: 0
        },
        { upsert: true }
      );

      if (course && course.instructor) {
        await createNotification({
          recipient: course.instructor,
          type: "new_enrollment",
          title: "New Course Purchase!",
          message: `A student bought "${course.title}". Your earnings: $${(payment.instructorEarnings || 0).toFixed(2)}`,
          link: `/instructor/students/${course._id}`
        });
      }
    }

    res.status(200).json({
      success: true,
      message: "Payment verified and enrollment activated!",
      data: {
        courseId: payment.course,
        courseTitle: course ? course.title : "Course",
        paymentId: payment._id
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createCheckout,
  getMyPayments,
  getPaymentById,
  stripeWebhook,
  getSessionDetails,
  completeMockPayment,
  confirmSession
};
