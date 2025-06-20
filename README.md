# StudentHub Dashboard

A modern, responsive web dashboard for student management built with Next.js 15, Supabase, and shadcn/ui components. This application provides a complete CRUD interface for managing student records with analytics, search functionality, and a beautiful user interface.

## 🚀 Features
![Screenshot 2025-06-20 154359](https://github.com/user-attachments/assets/53af47e9-ca42-4541-b184-6cf7aa4f952d)
![Screenshot 2025-06-20 154450](https://github.com/user-attachments/assets/2a388a56-7631-49ed-b846-add0c91dad8c)
![Screenshot 2025-06-20 154439](https://github.com/user-attachments/assets/c641aa12-63a6-4e97-b11f-ca9ff5e0d07a)
![Screenshot 2025-06-20 154422](https://github.com/user-attachments/assets/8a206d29-40f4-411e-ba3e-e983a04e0c1d)

- **Dashboard Overview**: View all students with key metrics (total students, average age, most popular course)
- **Student Management**: Add, edit, and delete student records
- **Advanced Search**: Filter students by name and course
- **Analytics**: Visual charts showing course distribution and age demographics
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Real-time Updates**: Instant UI updates after data operations
- **Form Validation**: Client-side validation with helpful error messages
- **Toast Notifications**: User-friendly feedback for all operations

## 🛠 Tech Stack

- **Frontend**: Next.js 15 (App Router), React 18, TypeScript
- **Backend**: Supabase (PostgreSQL database + Auth + Real-time)
- **UI Components**: shadcn/ui, Tailwind CSS
- **Charts**: Recharts
- **Forms**: React Hook Form
- **Icons**: Lucide React

## 📊 Database Schema

The application uses a single \`students\` table in Supabase PostgreSQL:

\`\`\`sql
CREATE TABLE students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age > 0 AND age < 150),
  course TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

### Database Integration

- **Supabase Client**: Configured with environment variables for secure connection
- **Row Level Security (RLS)**: Enabled for data protection
- **Real-time Subscriptions**: Ready for live updates (can be enabled)
- **Type Safety**: Full TypeScript integration with generated types

## 🔧 API Endpoints

This application uses Supabase's auto-generated REST API. All operations are performed through the Supabase JavaScript client:

### Student Operations



#### Get All Students
\`\`\`typescript
const { data, error } = await supabase
  .from('students')
  .select('*')
  .order('created_at', { ascending: false })
\`\`\`

#### Create Student
\`\`\`typescript
const { data, error } = await supabase
  .from('students')
  .insert([{
    name: 'John Doe',
    age: 20,
    course: 'Computer Science'
  }])
\`\`\`

#### Update Student
\`\`\`typescript
const { data, error } = await supabase
  .from('students')
  .update({
    name: 'Jane Doe',
    age: 21,
    course: 'AI'
  })
  .eq('id', studentId)
\`\`\`

#### Delete Student
\`\`\`typescript
const { data, error } = await supabase
  .from('students')
  .delete()
  .eq('id', studentId)
\`\`\`

#### Search Students
\`\`\`typescript
const { data, error } = await supabase
  .from('students')
  .select('*')
  .ilike('name', \`%\${searchTerm}%\`)
  .eq('course', selectedCourse) // optional filter
\`\`\`

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- A Supabase account and project
- Git

### 1. Clone the Repository

\`\`\`bash
git clone <repository-url>
cd studenthub-dashboard
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
# or
yarn install
# or
pnpm install
\`\`\`

### 3. Environment Setup

Create a \`.env.local\` file in the root directory:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

**To get these values:**
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings > API
4. Copy the Project URL and anon/public key

### 4. Database Setup

Run the SQL script to create the students table:

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of \`scripts/create-students-table.sql\`
4. Click "Run" to execute the script

This will:
- Create the \`students\` table with proper constraints
- Enable Row Level Security
- Insert sample data for testing

### 5. Run the Development Server

\`\`\`bash
npm run dev
# or
yarn dev
# or
pnpm dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 Application Structure

\`\`\`
studenthub-dashboard/
├── app/                          # Next.js App Router pages
│   ├── add-student/             # Add student page
│   ├── analytics/               # Analytics dashboard
│   ├── search/                  # Search functionality
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Main dashboard
│   └── globals.css              # Global styles
├── components/                   # Reusable components
│   ├── ui/                      # shadcn/ui components
│   ├── navigation.tsx           # Header navigation
│   ├── student-table.tsx        # Student data table
│   ├── edit-student-modal.tsx   # Edit modal
│   └── delete-student-modal.tsx # Delete confirmation
├── lib/                         # Utility functions
│   ├── supabase.ts             # Supabase client config
│   └── utils.ts                # Helper functions
└── scripts/                     # Database scripts
    └── create-students-table.sql
\`\`\`

## 🔍 API Usage Examples

### Sample Requests and Responses

#### Creating a New Student

**Request:**
\`\`\`typescript
const newStudent = {
  name: "Alice Johnson",
  age: 22,
  course: "Computer Science"
}

const { data, error } = await supabase
  .from('students')
  .insert([newStudent])
\`\`\`

**Response (Success):**
\`\`\`json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Alice Johnson",
      "age": 22,
      "course": "Computer Science",
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  ],
  "error": null
}
\`\`\`

#### Fetching All Students

**Request:**
\`\`\`typescript
const { data, error } = await supabase
  .from('students')
  .select('*')
  .order('created_at', { ascending: false })
\`\`\`

**Response:**
\`\`\`json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Alice Johnson",
      "age": 22,
      "course": "Computer Science",
      "created_at": "2024-01-15T10:30:00.000Z"
    },
    {
      "id": "987fcdeb-51a2-43d1-9f12-345678901234",
      "name": "Bob Smith",
      "age": 20,
      "course": "AI",
      "created_at": "2024-01-14T15:45:00.000Z"
    }
  ],
  "error": null
}
\`\`\`

#### Error Response Example

\`\`\`json
{
  "data": null,
  "error": {
    "message": "duplicate key value violates unique constraint",
    "details": "Key (email)=(test@example.com) already exists.",
    "hint": null,
    "code": "23505"
  }
}
\`\`\`

## 🎨 UI Components

### Available Courses
- Computer Science
- AI (Artificial Intelligence)
- Biology
- Mathematics
- Physics
- Chemistry
- Engineering

### Form Validation Rules
- **Name**: Required, minimum 1 character
- **Age**: Required, must be between 1-100
- **Course**: Required, must select from available options

## 🔒 Security Features

- **Row Level Security (RLS)**: Enabled on the students table
- **Input Validation**: Both client-side and database-level constraints
- **SQL Injection Protection**: Parameterized queries through Supabase
- **Environment Variables**: Sensitive data stored securely

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Deploy to Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

**1. "relation 'students' does not exist"**
- Run the database setup script in Supabase SQL Editor
- Ensure your environment variables are correct

**2. "Invalid API key"**
- Check your \`.env.local\` file
- Verify the Supabase URL and anon key are correct
- Restart the development server after changing environment variables

**3. "Failed to fetch students"**
- Check your internet connection
- Verify Supabase project is active
- Check browser console for detailed error messages

### Getting Help

- Check the [Supabase Documentation](https://supabase.com/docs)
- Review [Next.js Documentation](https://nextjs.org/docs)
- Open an issue in this repository

## 🎯 Future Enhancements

- [ ] User authentication with Supabase Auth
- [ ] Real-time updates using Supabase subscriptions
- [ ] Export functionality (CSV, PDF)
- [ ] Bulk operations (import/export multiple students)
- [ ] Advanced filtering and sorting
- [ ] Student profile pages with additional details
- [ ] Dark mode support
- [ ] Email notifications
- [ ] Audit logs for data changes

---

Built with ❤️ by Saksham using Next.js, Supabase, and modern web technologies.
