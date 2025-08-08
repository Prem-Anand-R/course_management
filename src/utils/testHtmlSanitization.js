/**
 * Test utility for HTML sanitization functionality
 * Use this to verify that HTML stripping is working correctly
 */

import { 
  stripHtmlTags, 
  sanitizeCourseForStorage, 
  calculateStorageSavings,
  getContentPreview,
  containsHtmlTags
} from './htmlSanitizer';

import { 
  analyzeExistingData, 
  migrateExistingData,
  listBackups 
} from './dataMigration';

/**
 * Test HTML stripping with various HTML content examples
 */
export const testHtmlStripping = () => {
  console.log('🧪 Testing HTML Sanitization...');
  console.log('=====================================');

  const testCases = [
    {
      name: 'Rich Text with Inline Styles',
      input: '<h3><span style="background-color: rgb(255, 255, 255); color: rgb(17, 24, 39);">Basic Course Information</span></h3>',
      expected: 'Basic Course Information'
    },
    {
      name: 'Multiple Paragraphs with Formatting',
      input: '<p><strong>Introduction:</strong> This course covers <em>advanced topics</em> in web development.</p><p>You will learn about <span style="color: blue;">React</span> and <span style="color: green;">Node.js</span>.</p>',
      expected: 'Introduction: This course covers advanced topics in web development. You will learn about React and Node.js.'
    },
    {
      name: 'Lists with Styling',
      input: '<ul style="margin-left: 20px;"><li>HTML & CSS</li><li>JavaScript ES6+</li><li>React Hooks</li></ul>',
      expected: 'HTML & CSS JavaScript ES6+ React Hooks'
    },
    {
      name: 'Complex Nested HTML',
      input: '<div class="content"><h2 style="color: #333;">Course Overview</h2><div class="section"><p>This <strong>comprehensive course</strong> includes:</p><ol><li>Theory lessons</li><li>Practical exercises</li><li>Final project</li></ol></div></div>',
      expected: 'Course Overview This comprehensive course includes: Theory lessons Practical exercises Final project'
    },
    {
      name: 'HTML Entities',
      input: '<p>Price: $99 &amp; up. Use code &quot;SAVE20&quot; for 20% off!</p>',
      expected: 'Price: $99 & up. Use code "SAVE20" for 20% off!'
    },
    {
      name: 'Empty and Whitespace',
      input: '<p>   </p><div></div><span>   Some content   </span><p></p>',
      expected: 'Some content'
    }
  ];

  testCases.forEach((testCase, index) => {
    console.log(`\n${index + 1}. ${testCase.name}`);
    console.log('Input:', testCase.input);
    
    const result = stripHtmlTags(testCase.input);
    console.log('Output:', result);
    console.log('Expected:', testCase.expected);
    console.log('✅ Match:', result === testCase.expected ? 'YES' : 'NO');
    
    if (result !== testCase.expected) {
      console.log('❌ Difference detected!');
    }
  });

  console.log('\n=====================================');
  console.log('HTML Stripping Test Complete');
};

/**
 * Test course sanitization with a sample course object
 */
export const testCourseSanitization = () => {
  console.log('\n🧪 Testing Course Sanitization...');
  console.log('=====================================');

  const sampleCourse = {
    id: 'test-course-1',
    title: 'Advanced React Development',
    description: '<h3><span style="background-color: rgb(255, 255, 255); color: rgb(17, 24, 39);">Master React with this comprehensive course</span></h3><p>Learn <strong>advanced patterns</strong> and <em>best practices</em>.</p>',
    category: 'Programming',
    difficulty: 'Advanced',
    status: 'published',
    instructor: 'John Doe',
    sections: [
      {
        id: 'section-1',
        title: 'Getting Started',
        description: '<p>Introduction to <strong>React concepts</strong> and <span style="color: blue;">modern development</span>.</p>',
        lessons: [
          {
            id: 'lesson-1',
            title: 'What is React?',
            content: '<div class="lesson-content"><h4>React Overview</h4><p>React is a <strong>JavaScript library</strong> for building user interfaces.</p><ul><li>Component-based</li><li>Declarative</li><li>Learn once, write anywhere</li></ul></div>'
          },
          {
            id: 'lesson-2',
            title: 'Setting up the Environment',
            content: '<p>In this lesson, we\'ll set up our <em>development environment</em> with <span style="background-color: yellow;">Create React App</span>.</p>'
          }
        ]
      }
    ]
  };

  console.log('Original Course:');
  console.log('- Description:', sampleCourse.description);
  console.log('- Section Description:', sampleCourse.sections[0].description);
  console.log('- Lesson Content:', sampleCourse.sections[0].lessons[0].content);

  const sanitizedCourse = sanitizeCourseForStorage(sampleCourse);

  console.log('\nSanitized Course:');
  console.log('- Description:', sanitizedCourse.description);
  console.log('- Section Description:', sanitizedCourse.sections[0].description);
  console.log('- Lesson Content:', sanitizedCourse.sections[0].lessons[0].content);

  // Calculate storage savings
  const originalSize = JSON.stringify(sampleCourse).length;
  const sanitizedSize = JSON.stringify(sanitizedCourse).length;
  const savings = originalSize - sanitizedSize;
  const savingsPercentage = Math.round((savings / originalSize) * 100);

  console.log('\nStorage Analysis:');
  console.log(`- Original size: ${originalSize} characters`);
  console.log(`- Sanitized size: ${sanitizedSize} characters`);
  console.log(`- Savings: ${savings} characters (${savingsPercentage}%)`);

  console.log('\n=====================================');
  console.log('Course Sanitization Test Complete');

  return { original: sampleCourse, sanitized: sanitizedCourse };
};

/**
 * Test content preview functionality
 */
export const testContentPreview = () => {
  console.log('\n🧪 Testing Content Preview...');
  console.log('=====================================');

  const testContents = [
    '<h3>Long Course Description</h3><p>This is a very long course description that contains multiple paragraphs and should be truncated to show only a preview of the content. The preview should strip HTML tags and show only plain text.</p>',
    '<p>Short content</p>',
    'Plain text without HTML',
    '<div><span style="color: red;">Styled content</span> with <strong>formatting</strong></div>'
  ];

  testContents.forEach((content, index) => {
    console.log(`\n${index + 1}. Testing content preview:`);
    console.log('Original:', content);
    console.log('Preview (50 chars):', getContentPreview(content, 50));
    console.log('Preview (100 chars):', getContentPreview(content, 100));
    console.log('Contains HTML:', containsHtmlTags(content));
  });

  console.log('\n=====================================');
  console.log('Content Preview Test Complete');
};

/**
 * Test data migration functionality
 */
export const testDataMigration = () => {
  console.log('\n🧪 Testing Data Migration...');
  console.log('=====================================');

  // Analyze existing data
  const analysis = analyzeExistingData();
  console.log('Data Analysis:', analysis);

  // List available backups
  const backups = listBackups();
  console.log('Available Backups:', backups);

  console.log('\n=====================================');
  console.log('Data Migration Test Complete');

  return { analysis, backups };
};

/**
 * Run all tests
 */
export const runAllSanitizationTests = () => {
  console.log('🚀 Running All HTML Sanitization Tests...');
  console.log('==========================================');

  try {
    // Test HTML stripping
    testHtmlStripping();

    // Test course sanitization
    const courseTest = testCourseSanitization();

    // Test content preview
    testContentPreview();

    // Test data migration
    const migrationTest = testDataMigration();

    console.log('\n🎉 All Tests Completed Successfully!');
    console.log('==========================================');

    return {
      success: true,
      courseTest,
      migrationTest
    };
  } catch (error) {
    console.error('❌ Test execution failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Demonstrate storage savings with real data
 */
export const demonstrateStorageSavings = () => {
  console.log('\n💾 Storage Savings Demonstration...');
  console.log('=====================================');

  const htmlContent = `
    <div class="course-description" style="padding: 20px; background-color: #f5f5f5;">
      <h2 style="color: #333; font-family: Arial, sans-serif;">Complete Web Development Bootcamp</h2>
      <p style="line-height: 1.6; color: #666;">
        This <strong style="color: #000;">comprehensive course</strong> covers everything you need to know about 
        <em style="font-style: italic;">modern web development</em>.
      </p>
      <ul style="margin-left: 20px; list-style-type: disc;">
        <li style="margin-bottom: 5px;">HTML5 & CSS3</li>
        <li style="margin-bottom: 5px;">JavaScript ES6+</li>
        <li style="margin-bottom: 5px;">React & Redux</li>
        <li style="margin-bottom: 5px;">Node.js & Express</li>
        <li style="margin-bottom: 5px;">MongoDB & Mongoose</li>
      </ul>
      <div class="highlight" style="background-color: yellow; padding: 10px; margin-top: 15px;">
        <p style="margin: 0; font-weight: bold;">
          🎯 Perfect for beginners and intermediate developers!
        </p>
      </div>
    </div>
  `;

  const plainText = stripHtmlTags(htmlContent);
  const savings = calculateStorageSavings(htmlContent, plainText);

  console.log('Original HTML Content:');
  console.log(htmlContent);
  console.log('\nStripped Plain Text:');
  console.log(plainText);
  console.log('\nStorage Savings:');
  console.log(`- Original size: ${savings.originalSize} bytes`);
  console.log(`- Stripped size: ${savings.strippedSize} bytes`);
  console.log(`- Savings: ${savings.savings} bytes (${savings.savingsPercentage}%)`);

  console.log('\n=====================================');
  console.log('Storage Savings Demonstration Complete');

  return savings;
};

// Export test functions
export default {
  testHtmlStripping,
  testCourseSanitization,
  testContentPreview,
  testDataMigration,
  runAllSanitizationTests,
  demonstrateStorageSavings
};
