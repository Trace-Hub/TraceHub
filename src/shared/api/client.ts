async function apiClient(path: string, options: RequestInit = {}): Promise<Response> {
    return fetch(path, {
        ...options,
        // httpOnly 쿠키 기반 인증 시 브라우저가 자동으로 쿠키를 포함시키도록 설정
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
    })
}

export { apiClient }
