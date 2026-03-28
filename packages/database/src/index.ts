import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

const connectionString = "postgresql://neondb_owner:npg_DUBFMgko6J7y@ep-proud-water-a1s4v5z0-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export { prisma };