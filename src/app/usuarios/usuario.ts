export class Usuario {
  id:number;
  username:string;
  password:string;
  nombre:string;
  apellido:string;
  email:string;
  roles:string[]=[];

  constructor(){
    this.id= 0;
    this.username="";
    this.password="";
    this.nombre="";
    this.apellido="";
    this.email="";
    this.roles =[];
  }
}
