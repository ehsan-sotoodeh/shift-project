// utils/authFetch.ts
export async function authFetch(input: RequestInfo, init?: RequestInit) {
    // Retrieve the token from localStorage (or any secure storage)
    const token = localStorage.getItem("token");
    // Merge any existing headers with our Authorization header.
    const modifiedInit: RequestInit = {
        ...init,
        headers: {
            ...(init?.headers || {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    };

    // Call the native fetch with the modified initialization object.
    return fetch(input, modifiedInit);
}
