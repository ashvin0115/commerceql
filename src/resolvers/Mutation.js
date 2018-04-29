const isEmail = require('validator/lib/isEmail')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

const { calculateOrderTotal } = require('../utils')

const Mutation = {
  checkout: async (_, args, ctx, info) => {
    const { email, token, currency, items, ...rest } = args

    if (!isEmail(email)) {
      throw new Error(`${email} is not a valid email`)
    }

    const total = await calculateOrderTotal(items)

    const { id: reference, status, ...theRest } = await stripe.charges.create({
      amount: total,
      currency,
      source: token,
      receipt_email: email
    })

    const order = await ctx.db.mutation.createOrder(
      {
        data: {
          items: { create: items },
          payments: {
            create: {
              reference,
              status,
              currency
            }
          },
          email,
          total,
          currency,
          ...rest
        }
      },
      info
    )

    return order
  }
}

module.exports = { Mutation }
