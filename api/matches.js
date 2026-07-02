export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  // Completely disable caching to guarantee instant Live Score updates
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // In production, the API Key should be set in Vercel Environment Variables
    const apiKey = process.env.FOOTBALL_API_KEY;
    
    let apiRes = null;
    let fallbackToMock = false;
    
    if (!apiKey) {
       fallbackToMock = true;
    } else {
       apiRes = await fetch(`https://api.football-data.org/v4/matches?t=${Date.now()}`, {
         headers: {
           'X-Auth-Token': apiKey,
           'Cache-Control': 'no-cache',
           'Pragma': 'no-cache'
         }
       });
       if (!apiRes.ok) fallbackToMock = true;
    }
    
    if (fallbackToMock) {
      // Fallback to mock data so the app still functions visually
      return res.status(200).json({
        matches: [
          {
            id: 101010,
            status: "FINISHED",
            utcDate: new Date(Date.now() - 86400000).toISOString(),
            homeTeam: { name: "United States", tla: "USA" },
            awayTeam: { name: "Bosnia-Herzegovina", tla: "BIH" },
            score: {
              winner: "HOME_TEAM",
              fullTime: { home: 2, away: 0 }
            }
          },
          {
            id: 202020,
            status: "IN_PLAY",
            utcDate: new Date().toISOString(),
            homeTeam: { name: "Spain", tla: "ESP" },
            awayTeam: { name: "Austria", tla: "AUT" },
            score: {
              winner: null,
              duration: "REGULAR",
              fullTime: { home: null, away: null },
              regularTime: { home: null, away: null },
              halfTime: { home: 0, away: 0 }
            }
          }
        ]
      });
    }
    
    const data = await apiRes.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
