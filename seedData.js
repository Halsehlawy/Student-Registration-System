const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const User = require('./models/user');
const Student = require('./models/student');
const Instructor = require('./models/instructor');
const Class = require('./models/class');

mongoose.connect(process.env.MONGODB_URI);

const seedData = async () => {
    try {
        // Read data from JSON file
        console.log('📖 Reading data from JSON file...');
        const dataPath = path.join(__dirname, 'data', 'seedRecords.json');
        const rawData = fs.readFileSync(dataPath, 'utf8');
        const data = JSON.parse(rawData);

        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await User.deleteMany({});
        await Student.deleteMany({});
        await Instructor.deleteMany({});
        await Class.deleteMany({});

        // Create users with hashed passwords
        console.log('👤 Creating users...');
        const saltRounds = 10;
        const createdUsers = {};

        for (const userData of data.users) {
            const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
            const user = await User.create({
                username: userData.username,
                password: hashedPassword,
                role: userData.role
            });
            createdUsers[userData.username] = user;
        }

        // Create instructors and link them to users
        console.log('👨‍🏫 Creating instructors...');
        const createdInstructors = {};

        for (const instructorData of data.instructors) {
            const user = createdUsers[instructorData.username];
            const instructor = await Instructor.create({
                id: instructorData.id,
                name: instructorData.name,
                image: instructorData.image,
                contact: instructorData.contact,
                address: instructorData.address,
                user: user._id
            });
            
            // Link user back to instructor
            await User.findByIdAndUpdate(user._id, { 
                linkedInstructor: instructor._id 
            });
            
            createdInstructors[instructorData.id] = instructor;
        }

        // Create students
        console.log('👨‍🎓 Creating students...');
        const createdStudents = {};

        for (const studentData of data.students) {
            const student = await Student.create({
                id: studentData.id,
                name: studentData.name,
                image: studentData.image,
                parent_contact: studentData.parent_contact,
                address: studentData.address
            });
            createdStudents[studentData.id] = student;
        }

        // Create classes and establish relationships
        console.log('📚 Creating classes...');
        const createdClasses = [];

        for (const classData of data.classes) {
            // Find instructor by ID
            const instructor = createdInstructors[classData.instructor_id];
            
            // Find students by IDs
            const students = classData.student_ids.map(id => createdStudents[id]._id);

            const classObj = await Class.create({
                id: classData.id,
                name: classData.name,
                subject: classData.subject,
                schedule: classData.schedule,
                instructor: instructor._id,
                students: students,
                room: classData.room,
                capacity: classData.capacity,
                description: classData.description
            });

            createdClasses.push(classObj);
        }

        // Summary
        console.log('\n✅ Database seeded successfully!');
        console.log('📊 Summary:');
        console.log(`   👤 Users: ${data.users.length}`);
        console.log(`   👨‍🎓 Students: ${data.students.length}`);
        console.log(`   👨‍🏫 Instructors: ${data.instructors.length}`);
        console.log(`   📚 Classes: ${data.classes.length}`);
        
        console.log('\n🔑 Login Credentials:');
        console.log('   Admin: admin / password123');
        console.log('   Instructors:');
        data.instructors.forEach(instructor => {
            console.log(`   - ${instructor.username} / password123`);
        });
        
    } catch (error) {
        console.error('❌ Error seeding database:', error);
    } finally {
        mongoose.connection.close();
    }
};

seedData();