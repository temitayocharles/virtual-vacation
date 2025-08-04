import { Router, Request, Response } from 'express'

const router = Router()

router.get('/country/:countryCode', async (req: Request, res: Response) => {
  try {
    // This would integrate with Radio Garden API or similar service
    // For now, return sample data
    res.json([
      {
        id: '1',
        name: 'Local FM',
        streamUrl: 'https://example.com/stream1',
        genre: 'Pop',
        language: 'English'
      }
    ])
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch radio stations' })
  }
})

export default router
