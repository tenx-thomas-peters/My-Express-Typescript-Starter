import bcrypt from "bcrypt";
import { CreateUserDto } from "@dtos/user.dto";
import { HttpException } from "@exceptions/HttpException";
import { User } from "@interfaces/users.interface";
import userModel from "@models/users.model";
import { isEmpty } from "@utils/util";
import { UserEntity } from "../entity/userEntity"

class UserService {
    public users = userModel;
    
    public async findAllUser(): Promise<UserEntity[]>{
        const users: UserEntity[] = await UserEntity.find()
        return users;
    }
    
    public async findUserById(userId: number): Promise<User>{
        const findUser: User = this.users.find(user => user.id === userId);
        if(!findUser) throw new HttpException(409, "You're not user");
        
        return findUser;
    }
    
    public async createUser(userData: CreateUserDto): Promise<User>{
        if(isEmpty(userData)) throw new HttpException(400, "You're not userData");
        
        const findUser: User = this.users.find(user => user.email === userData.email);
        if(findUser) throw new HttpException(409, `Your email ${userData.email} already exists`);
        
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const createUserData: User = { id: this.users.length + 1, ...userData, password: hashedPassword};
        this.users = [...this.users, createUserData];
        
        return createUserData;
    }
    
    
}

export default UserService;