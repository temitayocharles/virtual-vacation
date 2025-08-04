import { Router, Request, Response } from 'express'

const router = Router()

router.get('/ambient/:type', async (req: Request, res: Response) => {
  try {
    // Return sample ambient sounds
    res.json([
      {
        id: '1',
        name: 'City Traffic',
        url: '/sounds/city-traffic.mp3',
        duration: 300
      }
    ])
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sounds' })
  }
})

export default router
