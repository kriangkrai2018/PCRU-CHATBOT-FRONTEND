/**
 * Bot Configuration
 * Maps user types and roles to their corresponding bot images
 */

import bot1 from '@/assets/bots/bot1.jpg'
import bot2 from '@/assets/bots/bot2.jpg'
import bot3 from '@/assets/bots/bot3.jpg'
import botDefault from '@/assets/bots/bot2.jpg'

export const getBotAvatar = (userType = null) => {
  // Map user types to bot images
  const botMap = {
    'Super Admin': bot1,
    'Admin': bot2,
    'Officer': bot3,
    'User': botDefault
  }

  // Return corresponding bot image or default
  return botMap[userType] || botDefault
}

export default {
  getBotAvatar
}
