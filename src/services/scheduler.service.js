const cron = require("node-cron");
const WorkItem = require("../models/WorkItem");
const User = require("../models/User");
const { sendReminderEmail } = require("./email.service");

/**
 * Runs every minute.
 * Finds work items where:
 *   - reminder is enabled
 *   - reminderSent is false
 *   - dueDate is set
 *
 * If hasDueTime: fires when current time >= dueDate
 * If !hasDueTime: fires at 08:00 on the due date
 */
const startScheduler = () => {
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();

      // Fetch all pending reminders
      const items = await WorkItem.find({
        reminder: true,
        reminderSent: false,
        dueDate: { $ne: null },
      });

      for (const item of items) {
        const due = new Date(item.dueDate);
        let shouldFire = false;

        if (item.hasDueTime) {
          // Fire when current time has passed the exact due datetime
          shouldFire = now >= due;
        } else {
          // Fire at 08:00 on the due date
          const dueDay = new Date(due);
          dueDay.setHours(0, 0, 0, 0);

          const todayStart = new Date(now);
          todayStart.setHours(0, 0, 0, 0);

          const isSameDay = dueDay.getTime() === todayStart.getTime();
          const isAfter8am = now.getHours() >= 8;

          shouldFire = isSameDay && isAfter8am;

          // Also fire for overdue items (past due date, no time set)
          if (dueDay < todayStart) shouldFire = true;
        }

        if (shouldFire) {
          const user = await User.findById(item.owner);
          if (user && user.isVerified) {
            await sendReminderEmail(user, item);
            await WorkItem.findByIdAndUpdate(item._id, { reminderSent: true });
            console.log(`Reminder sent for item "${item.title}" to ${user.email}`);
          }
        }
      }
    } catch (err) {
      console.error("Scheduler error:", err.message);
    }
  });

  console.log("Reminder scheduler started");
};

module.exports = { startScheduler };
