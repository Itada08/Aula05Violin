// src/db.js
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PRODUCTS_PATH = join(__dirname, '..', 'data', 'products.json')
const USERS_PATH = join(__dirname, '..', 'data', 'users.json')

export async function readProducts() {
  try {
    const raw = await readFile(PRODUCTS_PATH, 'utf8')
    return JSON.parse(raw)
  } catch (err) {
    if (err.code === 'ENOENT') return []
    throw err
  }
}

export async function writeProducts(products) {
  await writeFile(PRODUCTS_PATH, JSON.stringify(products, null, 2), 'utf8')
}

export async function readUsers() {
  try {
    const raw = await readFile(USERS_PATH, 'utf8')
    return JSON.parse(raw)
  } catch (err) {
    if (err.code === 'ENOENT') return []
    throw err
  }
}

export async function writeUsers(users) {
  await writeFile(USERS_PATH, JSON.stringify(users, null, 2), 'utf8')
}
