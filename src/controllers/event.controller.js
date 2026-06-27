import { prisma } from "../config/db.js";

// Create event
export const createEvent = async (req, res) => {
  try {
    const { title, topic, speaker, eventDate, eventTime, location, description, imageUrl, isFree, mosqueId, maktabId } = req.body;

    if (mosqueId) {
      const mosque = await prisma.mosque.findUnique({ where: { id: mosqueId } });
      if (!mosque) {
        return res.status(404).json({ success: false, message: "Mosque not found" });
      }
    }

    if (maktabId) {
      const maktab = await prisma.maktab.findUnique({ where: { id: maktabId } });
      if (!maktab) {
        return res.status(404).json({ success: false, message: "Maktab not found" });
      }
    }

    const event = await prisma.event.create({
      data: {
        title,
        topic,
        speaker,
        eventDate: new Date(eventDate),
        eventTime,
        location,
        description,
        imageUrl,
        isFree: isFree !== undefined ? isFree : true,
        mosqueId,
        maktabId,
      },
    });

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Get events by region
export const getEventsByRegion = async (req, res) => {
  try {
    const { region } = req.params;

    const events = await prisma.event.findMany({
      where: {
        mosque: { region },
      },
      include: {
        mosque: { select: { name: true, address: true, region: true } },
      },
    });

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get event details
export const getEventDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        mosque: { select: { name: true, address: true, region: true } },
      },
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete event
export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    await prisma.event.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};