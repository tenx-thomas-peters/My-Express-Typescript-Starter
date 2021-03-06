import bcrypt from 'bcrypt';
import config from 'config';
import jwt from 'jsonwebtoken';
import { CreateUserDto } from "@dtos/user.dto";
import { HttpException } from '@exceptions/HttpException';
import {User} from "@entity/user";
import { isEmpty } from '@utils/util';
import {DataStoredInToken, TokenData} from "@interfaces/auth.interface";

class AuthService{

    public async signup(userData: CreateUserDto): Promise<User>{
        if (isEmpty(userData)) throw new HttpException(400, "You're not userData");
        const users: User[] = await User.find();

        const findUser: User = users.find(user => user.email === userData.email);
        if (findUser) throw new HttpException(409, `You're email ${userData.email} already exists`);

        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const createUserData:User = User.create(userData);
        createUserData.password = hashedPassword;
        const result = await User.save(createUserData);
        return result;
    }
    
    public async login(userData: CreateUserDto): Promise<{cookie: string; findUser: User }> {
        if(isEmpty(userData)) throw new HttpException(400, "You're not userData");
        const users: User[] = await User.find();
        
        const findUser: User = users.find(user => user.email === userData.email );
        if(!findUser) throw new HttpException(409, `You're email ${userData.email} not found`);
        
        const isPasswordMatching: boolean = await bcrypt.compare(userData.password, findUser.password);
        if(!isPasswordMatching) throw new HttpException(409, "You're password not matching");
        
        const tokenData = this.createToken(findUser);
        const cookie = this.createCooke(tokenData);
        
        return { cookie, findUser };
    }
    
    public async logout(userData: User): Promise<User> {
        if(isEmpty(userData)) throw new HttpException(400, "You're not userData");
        const users: User[] = await User.find();
        
        const findUser: User = users.find(user => user.email === userData.email && user.password === userData.password );
        if(!findUser) throw new HttpException(409, "You're not user");
        
        return findUser;
    }
    
    public createToken(user: User): TokenData{
        const dataStoredInToken: DataStoredInToken = { id: user.id };
        const secretKey: string = 'secretKey';
        const expiresIn : number = 60 * 60;
        
        return { expiresIn, token: jwt.sign(dataStoredInToken, secretKey, {expiresIn }) };
    }
    
    public createCooke(tokenData: TokenData): string{
        return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn};`;
    }
}

export default AuthService;