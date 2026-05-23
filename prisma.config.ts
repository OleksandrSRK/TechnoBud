import { defineConfig } from '@prisma/config'
import 'dotenv/config'
import process from 'process'

export default defineConfig({
    datasource: {
        url: process.env.DATABASE_URL,
    },
})