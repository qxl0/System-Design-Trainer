import { questions } from '../../data/questions'

export function findSeedByTitle(title: string) {
  return questions.find((q) => q.title === title)
}
