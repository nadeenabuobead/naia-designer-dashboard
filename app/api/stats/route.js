import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const reviews = await prisma.postOutfitReview.findMany({
      take: 100,
      orderBy: { createdAt: 'desc' },
      include: {
        session: {
          select: {
            currentMood: true,
            desiredFeeling: true,
            occasion: true,
            bodyPreference: true,
          },
        },
      },
    });

    const totalReviews = reviews.length;
    const totalUsers = await prisma.customer.count();

    // Calculate metrics
    const avgFeeling = reviews.reduce((sum, r) => sum + (r.overallFeeling || 0), 0) / totalReviews || 0;
    const feltLikeMe = reviews.filter(r => r.feltLikeHer === "Yes").length;
    const wouldWear = reviews.filter(r => r.wouldWearAgain === "Definitely").length;

    // Aggregate tags
    const workedTags = {};
    const didntWorkTags = {};
    
    reviews.forEach(r => {
      if (r.workedTags) {
        try {
          JSON.parse(r.workedTags).forEach(tag => {
            workedTags[tag] = (workedTags[tag] || 0) + 1;
          });
        } catch {}
      }
      if (r.didntWorkTags) {
        try {
          JSON.parse(r.didntWorkTags).forEach(tag => {
            didntWorkTags[tag] = (didntWorkTags[tag] || 0) + 1;
          });
        } catch {}
      }
    });

    // Top tags
    const topWorked = Object.entries(workedTags)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));

    const topDidntWork = Object.entries(didntWorkTags)
      .filter(([tag]) => tag !== "Everything worked")
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));

    // Emotional shifts with style context
    const shifts = {};
    reviews.forEach(r => {
      if (r.session?.currentMood && r.session?.desiredFeeling) {
        const shift = `${r.session.currentMood} → ${r.session.desiredFeeling}`;
        if (!shifts[shift]) shifts[shift] = { total: 0, count: 0, tags: {} };
        shifts[shift].total += r.overallFeeling || 0;
        shifts[shift].count += 1;
        
        // Associate worked tags with this shift
        if (r.workedTags) {
          try {
            JSON.parse(r.workedTags).forEach(tag => {
              shifts[shift].tags[tag] = (shifts[shift].tags[tag] || 0) + 1;
            });
          } catch {}
        }
      }
    });

    // Merge duplicate shifts (fix typos)
    const shiftKey = (name) => name.toLowerCase().replace('exicted', 'excited');
    const mergedShifts = {};
    Object.entries(shifts).forEach(([name, data]) => {
      const key = shiftKey(name);
      if (!mergedShifts[key]) mergedShifts[key] = { total: 0, count: 0, originalName: name, tags: {} };
      mergedShifts[key].total += data.total;
      mergedShifts[key].count += data.count;
      Object.entries(data.tags).forEach(([tag, count]) => {
        mergedShifts[key].tags[tag] = (mergedShifts[key].tags[tag] || 0) + count;
      });
    });

    const topShifts = Object.entries(mergedShifts)
      .map(([key, data]) => ({ 
        name: data.originalName.replace('exicted', 'excited'),
        avg: Math.round((data.total / data.count) * 10) / 10,
        count: data.count,
        topTags: Object.entries(data.tags).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([tag]) => tag)
      }))
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 10);

    // Occasions
    const occasions = {};
    reviews.forEach(r => {
      if (r.session?.occasion) {
        if (!occasions[r.session.occasion]) occasions[r.session.occasion] = { total: 0, count: 0 };
        occasions[r.session.occasion].total += r.overallFeeling || 0;
        occasions[r.session.occasion].count += 1;
      }
    });

    const topOccasions = Object.entries(occasions)
      .map(([name, data]) => ({ 
        name, 
        avg: Math.round((data.total / data.count) * 10) / 10,
        count: data.count 
      }))
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 10);

    // Body preferences
    const bodyPrefs = {};
    reviews.forEach(r => {
      if (r.session?.bodyPreference) {
        bodyPrefs[r.session.bodyPreference] = (bodyPrefs[r.session.bodyPreference] || 0) + 1;
      }
    });

    const topBodyPrefs = Object.entries(bodyPrefs)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([pref, count]) => ({ pref, count }));

    // User quotes
    const quotes = reviews
      .filter(r => r.additionalNotes)
      .slice(0, 10)
      .map(r => r.additionalNotes);

    return Response.json({
      totalReviews,
      totalUsers,
      avgFeeling: Math.round(avgFeeling * 10) / 10,
      feltLikeMePercent: Math.round((feltLikeMe / totalReviews) * 100) || 0,
      wouldWearPercent: Math.round((wouldWear / totalReviews) * 100) || 0,
      topWorked,
      topDidntWork,
      topShifts,
      topOccasions,
      topBodyPrefs,
      quotes,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}