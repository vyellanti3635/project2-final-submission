describe('Validation Unit Tests', () => {
  describe('Email Validation', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    test('should validate correct email format', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.com'
      ];

      validEmails.forEach(email => {
        expect(emailRegex.test(email)).toBe(true);
      });
    });

    test('should reject invalid email format', () => {
      const invalidEmails = [
        'notanemail',
        '@example.com',
        'user@',
        'user @example.com'
      ];

      invalidEmails.forEach(email => {
        expect(emailRegex.test(email)).toBe(false);
      });
    });
  });

  describe('Username Validation', () => {
    const isValidUsername = (username) => {
      return username && 
             username.length >= 3 && 
             username.length <= 20 &&
             /^[a-zA-Z0-9]+$/.test(username);
    };

    test('should validate correct username', () => {
      expect(isValidUsername('user123')).toBe(true);
      expect(isValidUsername('testuser')).toBe(true);
      expect(isValidUsername('abc')).toBe(true);
    });

    test('should reject invalid username', () => {
      expect(isValidUsername('ab')).toBe(false); // too short
      expect(isValidUsername('a'.repeat(21))).toBe(false); // too long
      expect(isValidUsername('user name')).toBe(false); // contains space
      expect(isValidUsername('user@123')).toBe(false); // special char
    });
  });

  describe('Password Validation', () => {
    const isValidPassword = (password) => {
      return password && password.length >= 8;
    };

    test('should validate correct password', () => {
      expect(isValidPassword('password123')).toBe(true);
      expect(isValidPassword('12345678')).toBe(true);
    });

    test('should reject invalid password', () => {
      expect(isValidPassword('short')).toBe(false);
      expect(isValidPassword('1234567')).toBe(false);
      expect(isValidPassword('')).toBeFalsy();
    });
  });

  describe('Post Content Validation', () => {
    const isValidPost = (title, content) => {
      return title && 
             title.length >= 5 && 
             title.length <= 200 &&
             content &&
             content.length >= 50;
    };

    test('should validate correct post', () => {
      const title = 'Valid Post Title';
      const content = 'A'.repeat(100);
      
      expect(isValidPost(title, content)).toBe(true);
    });

    test('should reject invalid post', () => {
      expect(isValidPost('Hi', 'A'.repeat(100))).toBe(false); // title too short
      expect(isValidPost('Valid Title', 'Short')).toBe(false); // content too short
      expect(isValidPost('', 'A'.repeat(100))).toBeFalsy(); // empty title
    });
  });

  describe('Comment Validation', () => {
    const isValidComment = (content) => {
      return content && 
             content.length >= 5 && 
             content.length <= 500;
    };

    test('should validate correct comment', () => {
      expect(isValidComment('Great post!')).toBe(true);
      expect(isValidComment('A'.repeat(100))).toBe(true);
    });

    test('should reject invalid comment', () => {
      expect(isValidComment('Hi')).toBe(false); // too short
      expect(isValidComment('A'.repeat(501))).toBe(false); // too long
      expect(isValidComment('')).toBeFalsy(); // empty
    });
  });
});
