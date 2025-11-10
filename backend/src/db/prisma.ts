import { Prisma, PrismaClient } from "@prisma/client"
import { withAccelerate } from "@prisma/extension-accelerate"

export const prisma = new PrismaClient().$extends(withAccelerate())

// let user: Prisma.UserCreateInput


// Depending on what your models look like, the Prisma Client API will look 
// different as well. For example, if you have a User model, your PrismaClient 
// instance exposes a property called user on which you can call CRUD methods 
// like findMany, create or update. The property is named after the model, 
// but the first letter is lowercased (so for the Post model it's called post, 
// for Profile it's called profile).