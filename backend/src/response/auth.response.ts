export default interface AuthResponse{
    success: boolean
    data: {
        token: string
        userId: string
    }
}