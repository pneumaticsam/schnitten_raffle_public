export class Login{
    constructor( 
        public phoneNumber?:number,
        public password?:string,
        public confirmPassword?:string,
        public legalChecked?:boolean
        ){}
}