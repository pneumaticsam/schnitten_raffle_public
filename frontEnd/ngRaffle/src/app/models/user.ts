export class User {
    id!: number;
    phone?: string
    //username!: string;
    password!: string;
    firstName!: string;
    lastName!: string;
    token!: string;
}

export class UserProfile {
    
    firstName!: string;
    lastName!: string;
    addressLine1!: string;
    addressLine2!: string;
    zipCode!: string;
}

