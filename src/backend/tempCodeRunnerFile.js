import readline from 'readline';
import twilio from 'twilio';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const recipientPhoneNumber = process.env.RECIPIENT_PHONE_NUMBER;
const geminiApiKey = process.env.GEMINI_API_KEY;

const client = twilio(accountSid, authToken);

console.log("🚀 Task Manager Started! (Type 'exit' to stop)\n");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let tasks = [];

// Function to send SMS using Twilio
const sendSMS = async (message) => {
    try {
        console.log("Sending SMS:", message);
        console.log("To:", recipientPhoneNumber);
        console.log("From:", twilioPhoneNumber);
        await client.messages.create({
            body: message,
            from: twilioPhoneNumber,
            to: recipientPhoneNumber
        });
        console.log("📩 Reminder SMS Sent!");
    } catch (error) {
        console.error("⚠ Error Sending SMS.", error.toJSON());
    }
};

// Function to schedule an SMS reminder
const scheduleSMS = (task, timeStr) => {
    const now = new Date();
    const match = timeStr.match(/(\d{1,2}):(\d{2})\s*([APap][Mm])/);

    if (!match) {
        console.log(⚠ Invalid time format for task: "${task}". Reminder not set.);
        return;
    }

    let [_, hours, minutes, period] = match;
    hours = parseInt(hours);
    minutes = parseInt(minutes);

    if (period.toLowerCase() === "pm" && hours !== 12) {
        hours += 12;
    } else if (period.toLowerCase() === "am" && hours === 12) {
        hours = 0;
    }

    let taskTime = new Date();
    taskTime.setHours(hours, minutes, 0, 0);

    const reminderTime = new Date(taskTime.getTime() - 10 * 60 * 1000); // 10 mins before
    const timeUntilReminder = reminderTime - now;

    if (timeUntilReminder > 0) {
        setTimeout(async () => {
            sendSMS(Reminder: "${task}" at ${timeStr}); //no suggestion
        }, timeUntilReminder);
        console.log(✅ Reminder scheduled for "${task}" at ${timeStr});
    } else {
        console.log(⚠ Task "${task}" is too close or already passed. No reminder set.);
    }
};

// Function to process tasks using Gemini AI
const processTasks = async (taskInput) => {
    try {
        const API_URL = https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent; // or gemini-1.0-pro

        const response = await axios.post(
            API_URL,
            {
                contents: [{
                    parts: [{
                        text: Extract tasks and their times from the given schedule. Return tasks in the format: Task @ Time (Example: Meeting @ 10:30 PM). If time is not provided, return only the task.\n\n${taskInput}
                    }]
                }],
                model: "models/gemini-1.5-pro" // or models/gemini-1.0-pro
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': geminiApiKey,
                },
            }
        );

        const responseContent = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!responseContent) {
            console.log("⚠ No valid content returned.");
            return [];
        }

        return responseContent.split('\n').map(task => task.replace(/^-?\s*/, '').trim()).filter(task => task);
    } catch (error) {
        console.error("⚠ Error Fetching Tasks.", error.toJSON());
        return [];
    }
};

// Function to continuously ask for tasks
const askTask = () => {
    rl.question("What's Your Next Plan? (Describe your schedule) ", async (taskInput) => {
        if (taskInput.toLowerCase() === "exit") {
            console.log("\n🔴 Task Manager Stopped.");
            rl.close();
            return;
        }

        const extractedTasks = await processTasks(taskInput);

        if (extractedTasks.length === 0) {
            console.log("⚠ No valid tasks found.");
            askTask();
            return;
        }

        extractedTasks.forEach((taskStr) => {
            const match = taskStr.match(/(.+?)\s*@\s*(\d{1,2}:\d{2}\s*[apAP][mM])/);
            if (match) {
                const task = match[1].trim();
                const timeStr = match[2].trim();
                tasks.push({ task, time: timeStr });
                console.log(✅ Task Added: "${task}" at ${timeStr});
                scheduleSMS(task, timeStr);
            } else {
                const task = taskStr.trim();
                tasks.push({ task, time: "No time specified" });
                console.log(✅ Task Added: "${task}");
            }
        });

        console.log("\n-------------------------------------\n");
        askTask();
    });
};

askTask();