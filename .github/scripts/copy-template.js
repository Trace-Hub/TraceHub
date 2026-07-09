import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const templatePath = join(__dirname, '..', '.gitmessage.txt')
const targetPath = process.argv[2]
const commitSource = process.argv[3] // 'message' = -m 플래그, 'template', 'merge' 등

// -m 플래그로 커밋하는 경우 템플릿 삽입 건너뜀
if (commitSource === 'message') {
  process.exit(0)
}

const existingMessage = readFileSync(targetPath, 'utf-8')
const template = readFileSync(templatePath, 'utf-8')

const hasExistingMessage = existingMessage
  .split('\n')
  .some((line) => line.trim() && !line.startsWith('#'))

if (!hasExistingMessage) {
  writeFileSync(targetPath, template)
}