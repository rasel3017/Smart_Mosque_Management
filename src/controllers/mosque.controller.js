import { prisma } from "../config/db.js";

// Add a new mosque
export const addMosque = async (req, res) => {
  try {
    const { name, address, region, latitude, longitude, imamName, muazzinName, imageUrl, fajrTime, zuhrTime, asrTime, maghribTime, ishaTime } = req.body;
    const userId = req.user.userId;

    const mosque = await prisma.mosque.create({
      data: { 
        name, address, region, latitude, longitude,
        imamName, muazzinName, imageUrl,
        fajrTime, zuhrTime, asrTime, maghribTime, ishaTime,
        user: { connect: { id: userId } }
      },
    });

    res.status(201).json({
      success: true,
      message: "Mosque added successfully",
      data: mosque,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Get mosques by region
export const getMosquesByRegion = async (req, res) => {
  try {
    const { region } = req.params;

    const mosques = await prisma.mosque.findMany({
      where: { region },
    });

    res.status(200).json({
      success: true,
      count: mosques.length,
      data: mosques,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get mosque details
export const getMosqueDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const mosque = await prisma.mosque.findUnique({
      where: { id },
      include: {
        maktabs: true,
        events: true,
      },
    });

    if (!mosque) {
      return res.status(404).json({
        success: false,
        message: "Mosque not found",
      });
    }

    res.status(200).json({
      success: true,
      data: mosque,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Search mosque by name
export const searchMosque = async (req, res) => {
  try {
    const { name } = req.params;

    const mosques = await prisma.mosque.findMany({
      where: {
        name: {
          contains: name,
          mode: "insensitive",
        },
      },
    });

    res.status(200).json({
      success: true,
      count: mosques.length,
      data: mosques,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// Add funding to mosque
export const addMosqueFunding = async (req, res) => {
  try {
    const { mosqueId } = req.params;
    const { note } = req.body;
    const amount = Number(req.body.amount);
    const donorName = req.body.donorName || "Anonymous";

    const mosque = await prisma.mosque.findUnique({
      where: { id: mosqueId },
    });

    if (!mosque) {
      return res.status(404).json({
        success: false,
        message: "Mosque not found",
      });
    }

    const funding = await prisma.funding.create({
      data: { donorName, amount, note, mosqueId },
    });

    res.status(201).json({
      success: true,
      message: "Funding added successfully",
      data: funding,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get mosque funding history
export const getMosqueFundingHistory = async (req, res) => {
  try {
    const { mosqueId } = req.params;

    const fundings = await prisma.funding.findMany({
      where: { mosqueId },
      orderBy: { donatedAt: "desc" },
    });

    const total = fundings.reduce((sum, f) => sum + f.amount, 0);

    res.status(200).json({
      success: true,
      count: fundings.length,
      totalAmount: total,
      data: fundings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete mosque
export const deleteMosque = async (req, res) => {
  try {
    const { id } = req.params;

    const mosque = await prisma.mosque.findUnique({
      where: { id },
    });

    if (!mosque) {
      return res.status(404).json({
        success: false,
        message: "Mosque not found",
      });
    }

    await prisma.mosque.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: "Mosque deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};