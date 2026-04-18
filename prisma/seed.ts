import 'dotenv/config'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from '@prisma/client'
import { questions } from '../data/questions'

const dbUrl = (process.env['DATABASE_URL'] ?? 'file:./dev.db').replace('file:', '')
const adapter = new PrismaBetterSqlite3({ url: dbUrl })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding database...')
  await prisma.question.deleteMany()

  for (const q of questions) {
    await prisma.question.create({
      data: {
        title: q.title,
        prompt: q.prompt,
        difficulty: q.difficulty,
        category: q.category,
        tags: JSON.stringify(q.tags),
        modelAnswer: q.modelAnswer,
      },
    })
  }

  console.log(`Seeded ${questions.length} questions.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
