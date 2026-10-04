// src/server.js
import express from 'express'
import {
  readProducts,
  writeProducts,
  readUsers,
  writeUsers,
} from './db.js'

const app = express()
const PORT = 3000

app.use(express.json())

// ---------------------------------------------------------------
// PRODUCTS
// ---------------------------------------------------------------

// GET /products — lista só os ativos (não removidos via soft delete)
app.get('/products', async (req, res) => {
  const products = await readProducts()
  res.json(products.filter((p) => !p.deletedAt))
})

app.get('/products/:id', async (req, res) => {
  const id = Number(req.params.id)
  const products = await readProducts()
  const product = products.find((p) => p.id === id && !p.deletedAt)

  if (!product) {
    return res.status(404).json({ erro: 'Produto não encontrado' })
  }

  res.json(product)
})

// -----------------------------------------------------------------
// Exercício 1 (Fácil) — DELETE /products/:id com HARD delete.
// Ficou registrado aqui, comentado, como ponto de partida — porque o
// Exercício 2 pede para migrar essa mesma rota para soft delete.
// -----------------------------------------------------------------
//
// app.delete('/products/:id', async (req, res) => {
//   const id = Number(req.params.id)
//   const products = await readProducts()
//   const idx = products.findIndex((p) => p.id === id)
//
//   if (idx === -1) {
//     return res.status(404).json({ erro: 'Produto não encontrado' })
//   }
//
//   products.splice(idx, 1) // remove de verdade do array
//   await writeProducts(products)
//   res.status(204).end()
// })

// -----------------------------------------------------------------
// Exercício 2 (Médio) — a mesma rota, migrada para SOFT delete.
// Em vez de splice, só marca deletedAt. O GET /products (acima) já
// filtra quem tem deletedAt preenchido, então o produto "some" da
// listagem sem perder o registro.
// -----------------------------------------------------------------
app.delete('/products/:id', async (req, res) => {
  const id = Number(req.params.id)
  const products = await readProducts()
  const product = products.find((p) => p.id === id)

  if (!product) {
    return res.status(404).json({ erro: 'Produto não encontrado' })
  }
  if (product.deletedAt) {
    return res.status(409).json({ erro: 'Produto já removido' })
  }

  product.deletedAt = new Date().toISOString()
  await writeProducts(products)
  res.status(204).end()
})

// ---------------------------------------------------------------
// USERS
// ---------------------------------------------------------------

app.get('/users', async (req, res) => {
  const users = await readUsers()
  res.json(users.filter((u) => !u.deletedAt))
})

app.get('/users/:id', async (req, res) => {
  const id = Number(req.params.id)
  const users = await readUsers()
  const user = users.find((u) => u.id === id && !u.deletedAt)

  if (!user) {
    return res.status(404).json({ erro: 'Usuário não encontrado' })
  }

  res.json(user)
})

// -----------------------------------------------------------------
// Exercício 3 (Difícil) — DELETE /users/:id?force=true
// Por padrão faz soft delete (igual aos products). Só quando vem
// ?force=true é que remove de verdade (hard delete) do array.
// -----------------------------------------------------------------
app.delete('/users/:id', async (req, res) => {
  const id = Number(req.params.id)
  const force = req.query.force === 'true'
  const users = await readUsers()

  if (force) {
    // hard delete — remove de verdade
    const idx = users.findIndex((u) => u.id === id)
    if (idx === -1) {
      return res.status(404).json({ erro: 'Usuário não encontrado' })
    }
    users.splice(idx, 1)
    await writeUsers(users)
    return res.status(204).end()
  }

  // soft delete — marca deletedAt
  const user = users.find((u) => u.id === id)
  if (!user) {
    return res.status(404).json({ erro: 'Usuário não encontrado' })
  }
  if (user.deletedAt) {
    return res.status(409).json({ erro: 'Usuário já removido' })
  }

  user.deletedAt = new Date().toISOString()
  await writeUsers(users)
  res.status(204).end()
})

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`)
})
