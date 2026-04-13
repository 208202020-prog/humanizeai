import { stripe } from '@/lib/stripe/client'
import { createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const PLAN_PRICE_MAP: Record<string, string> = {
  [process.env.STRIPE_BASIC_MONTHLY_PRICE_ID || '']: 'basic',
  [process.env.STRIPE_BASIC_ANNUAL_PRICE_ID || '']: 'basic',
  [process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID || '']: 'premium',
  [process.env.STRIPE_PREMIUM_ANNUAL_PRICE_ID || '']: 'premium',
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = await createServiceClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode !== 'subscription') break

        const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
        const priceId = subscription.items.data[0]?.price.id
        const plan = PLAN_PRICE_MAP[priceId] || 'free'
        const userId = subscription.metadata.supabase_user_id

        if (userId) {
          await supabase
            .from('profiles')
            .update({
              plan,
              stripe_subscription_id: subscription.id,
              subscription_status: subscription.status,
            })
            .eq('id', userId)
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const priceId = subscription.items.data[0]?.price.id
        const plan = PLAN_PRICE_MAP[priceId] || 'free'
        const userId = subscription.metadata.supabase_user_id

        if (userId) {
          await supabase
            .from('profiles')
            .update({
              plan: subscription.status === 'active' ? plan : 'free',
              subscription_status: subscription.status,
            })
            .eq('id', userId)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata.supabase_user_id

        if (userId) {
          await supabase
            .from('profiles')
            .update({
              plan: 'free',
              stripe_subscription_id: null,
              subscription_status: 'canceled',
            })
            .eq('id', userId)
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
