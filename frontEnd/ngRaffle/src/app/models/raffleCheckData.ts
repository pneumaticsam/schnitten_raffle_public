export class RaffleCheckData{
    constructor(
        public rCode:string,
        public userId:String
    ){}
}

export class RaffleCheckResponse{
    constructor(
        public checkID:string,
        public isWin:boolean,
        public desc:string
    ){}
}