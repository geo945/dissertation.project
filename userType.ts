type User = {
    username: string
    firstName: string
    lastName: string
    email: string
    age: number
    dateOfBirth: Date
    isMarried: boolean
    addresses: {
        street: string
        city: string
        country: string
        purchaseDate: Date
    } [];
}