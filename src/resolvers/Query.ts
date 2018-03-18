import { Context } from '../utils'

export default {
  products: (parent, args, ctx: Context, info) => {
    return ctx.db.query.products({ where: { isActive: true } }, info)
  }
}
