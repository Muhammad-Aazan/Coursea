const BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "http://localhost:5000/api" : "https://coursea-liart.vercel.app/api");

export async function request(endpoint, options = {}) {
  const token = localStorage.getItem("coursea_token");
  const headers = { ...options.headers };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // If not FormData, default to application/json
  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const config = {
    ...options,
    headers
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || "An error occurred");
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  get: (endpoint, params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        query.append(key, val);
      }
    });
    const queryString = query.toString() ? `?${query.toString()}` : "";
    return request(`${endpoint}${queryString}`, { method: "GET" });
  },

  post: (endpoint, body) => {
    const isFormData = body instanceof FormData;
    return request(endpoint, {
      method: "POST",
      body: isFormData ? body : JSON.stringify(body)
    });
  },

  patch: (endpoint, body) => {
    const isFormData = body instanceof FormData;
    return request(endpoint, {
      method: "PATCH",
      body: isFormData ? body : JSON.stringify(body)
    });
  },

  delete: (endpoint) => {
    return request(endpoint, { method: "DELETE" });
  },

  upload: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return request("/upload", {
      method: "POST",
      body: formData
    });
  }
};
