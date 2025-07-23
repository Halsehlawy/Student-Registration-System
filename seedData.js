const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Student = require('./models/student');
const Instructor = require('./models/instructor');
const Class = require('./models/class');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

const seedData = async () => {
    try {
        // Clear existing data
        console.log('Clearing existing data...');
        await Student.deleteMany({});
        await Instructor.deleteMany({});
        await Class.deleteMany({});

        // Sample Students
        console.log('Creating students...');
        const students = await Student.create([
            {
                id: 1001,
                name: 'John Smith',
                image: 'https://randomuser.me/api/portraits/men/1.jpg',
                parent_contact: '+1-555-0101',
                address: '123 Oak Street, Springfield, IL 62701'
            },
            {
                id: 1002,
                name: 'Sarah Johnson',
                image: 'https://randomuser.me/api/portraits/women/2.jpg',
                parent_contact: '+1-555-0102',
                address: '456 Pine Avenue, Springfield, IL 62702'
            },
            {
                id: 1003,
                name: 'Michael Brown',
                image: 'https://randomuser.me/api/portraits/men/3.jpg',
                parent_contact: '+1-555-0103',
                address: '789 Elm Drive, Springfield, IL 62703'
            },
            {
                id: 1004,
                name: 'Emily Davis',
                image: 'https://randomuser.me/api/portraits/women/4.jpg',
                parent_contact: '+1-555-0104',
                address: '321 Maple Lane, Springfield, IL 62704'
            },
            {
                id: 1005,
                name: 'David Wilson',
                image: 'https://randomuser.me/api/portraits/men/5.jpg',
                parent_contact: '+1-555-0105',
                address: '654 Cedar Street, Springfield, IL 62705'
            },
            {
                id: 1006,
                name: 'Jessica Martinez',
                image: 'https://randomuser.me/api/portraits/women/6.jpg',
                parent_contact: '+1-555-0106',
                address: '987 Birch Road, Springfield, IL 62706'
            },
            {
                id: 1007,
                name: 'Christopher Taylor',
                image: 'https://randomuser.me/api/portraits/men/7.jpg',
                parent_contact: '+1-555-0107',
                address: '147 Walnut Circle, Springfield, IL 62707'
            },
            {
                id: 1008,
                name: 'Amanda Anderson',
                image: 'https://randomuser.me/api/portraits/women/8.jpg',
                parent_contact: '+1-555-0108',
                address: '258 Hickory Place, Springfield, IL 62708'
            }
        ]);

        // Sample Instructors
        console.log('Creating instructors...');
        const instructors = await Instructor.create([
            {
                id: 2001,
                name: 'Dr. Robert Thompson',
                image: 'https://randomuser.me/api/portraits/men/20.jpg',
                contact: '+1-555-2001',
                address: '100 University Drive, Springfield, IL 62710'
            },
            {
                id: 2002,
                name: 'Prof. Linda Rodriguez',
                image: 'https://randomuser.me/api/portraits/women/21.jpg',
                contact: '+1-555-2002',
                address: '200 College Avenue, Springfield, IL 62711'
            },
            {
                id: 2003,
                name: 'Dr. James Mitchell',
                image: 'https://randomuser.me/api/portraits/men/22.jpg',
                contact: '+1-555-2003',
                address: '300 Academic Street, Springfield, IL 62712'
            },
            {
                id: 2004,
                name: 'Prof. Maria Garcia',
                image: 'https://randomuser.me/api/portraits/women/23.jpg',
                contact: '+1-555-2004',
                address: '400 Education Boulevard, Springfield, IL 62713'
            },
            {
                id: 2005,
                name: 'Dr. William Lee',
                image: 'https://randomuser.me/api/portraits/men/24.jpg',
                contact: '+1-555-2005',
                address: '500 Learning Lane, Springfield, IL 62714'
            }
        ]);

        // Sample Classes
        console.log('Creating classes...');
        const classes = await Class.create([
            {
                id: 3001,
                name: 'Introduction to Computer Science',
                subject: 'Computer Science',
                schedule: 'Mon, Wed, Fri - 9:00 AM',
                instructor: instructors[0]._id,
                students: [students[0]._id, students[1]._id, students[2]._id],
                room: 'CS-101',
                capacity: 25,
                description: 'An introductory course covering basic programming concepts and computational thinking.'
            },
            {
                id: 3002,
                name: 'Advanced Mathematics',
                subject: 'Mathematics',
                schedule: 'Tue, Thu - 10:30 AM',
                instructor: instructors[1]._id,
                students: [students[1]._id, students[3]._id, students[4]._id, students[5]._id],
                room: 'MATH-201',
                capacity: 20,
                description: 'Advanced mathematical concepts including calculus and linear algebra.'
            },
            {
                id: 3003,
                name: 'Physics Laboratory',
                subject: 'Physics',
                schedule: 'Wed - 2:00 PM',
                instructor: instructors[2]._id,
                students: [students[2]._id, students[4]._id, students[6]._id],
                room: 'PHY-LAB-1',
                capacity: 15,
                description: 'Hands-on laboratory experiments in mechanics and thermodynamics.'
            },
            {
                id: 3004,
                name: 'English Literature',
                subject: 'English',
                schedule: 'Mon, Wed - 11:00 AM',
                instructor: instructors[3]._id,
                students: [students[0]._id, students[3]._id, students[5]._id, students[7]._id],
                room: 'ENG-301',
                capacity: 30,
                description: 'Study of classic and contemporary literature with focus on critical analysis.'
            },
            {
                id: 3005,
                name: 'Data Structures & Algorithms',
                subject: 'Computer Science',
                schedule: 'Tue, Thu - 1:00 PM',
                instructor: instructors[0]._id,
                students: [students[1]._id, students[2]._id, students[6]._id, students[7]._id],
                room: 'CS-201',
                capacity: 22,
                description: 'Advanced programming course focusing on efficient data structures and algorithms.'
            },
            {
                id: 3006,
                name: 'World History',
                subject: 'History',
                schedule: 'Mon, Fri - 3:00 PM',
                instructor: instructors[4]._id,
                students: [students[0]._id, students[4]._id, students[5]._id],
                room: 'HIST-101',
                capacity: 35,
                description: 'Comprehensive overview of world history from ancient civilizations to modern times.'
            }
        ]);

        console.log('✅ Database seeded successfully!');
        console.log(`Created ${students.length} students`);
        console.log(`Created ${instructors.length} instructors`);
        console.log(`Created ${classes.length} classes`);

        // Display summary
        console.log('\n📊 Summary:');
        console.log('Students:', students.map(s => `${s.name} (ID: ${s.id})`));
        console.log('Instructors:', instructors.map(i => `${i.name} (ID: ${i.id})`));
        console.log('Classes:', classes.map(c => `${c.name} (ID: ${c.id})`));

    } catch (error) {
        console.error('❌ Error seeding database:', error);
    } finally {
        mongoose.connection.close();
        console.log('Database connection closed.');
    }
};

// Run the seed function
seedData();