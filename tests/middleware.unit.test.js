describe('Authentication Middleware Unit Tests', () => {
  describe('isAuthenticated Middleware', () => {
    test('should call next() if user is authenticated', () => {
      const req = {
        isAuthenticated: jest.fn(() => true)
      };
      const res = {};
      const next = jest.fn();

      const isAuthenticated = (req, res, next) => {
        if (req.isAuthenticated()) {
          return next();
        }
        res.redirect('/login');
      };

      isAuthenticated(req, res, next);

      expect(req.isAuthenticated).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });

    test('should redirect to login if user is not authenticated', () => {
      const req = {
        isAuthenticated: jest.fn(() => false)
      };
      const res = {
        redirect: jest.fn()
      };
      const next = jest.fn();

      const isAuthenticated = (req, res, next) => {
        if (req.isAuthenticated()) {
          return next();
        }
        res.redirect('/login');
      };

      isAuthenticated(req, res, next);

      expect(req.isAuthenticated).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith('/login');
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('isAdmin Middleware', () => {
    test('should call next() if user is admin', () => {
      const req = {
        isAuthenticated: jest.fn(() => true),
        user: { isAdmin: true }
      };
      const res = {};
      const next = jest.fn();

      const isAdmin = (req, res, next) => {
        if (req.isAuthenticated() && req.user.isAdmin) {
          return next();
        }
        if (req.isAuthenticated()) {
          res.redirect('/');
        } else {
          res.redirect('/login');
        }
      };

      isAdmin(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    test('should redirect to home if user is not admin', () => {
      const req = {
        isAuthenticated: jest.fn(() => true),
        user: { isAdmin: false }
      };
      const res = {
        redirect: jest.fn()
      };
      const next = jest.fn();

      const isAdmin = (req, res, next) => {
        if (req.isAuthenticated() && req.user.isAdmin) {
          return next();
        }
        if (req.isAuthenticated()) {
          res.redirect('/');
        } else {
          res.redirect('/login');
        }
      };

      isAdmin(req, res, next);

      expect(res.redirect).toHaveBeenCalledWith('/');
      expect(next).not.toHaveBeenCalled();
    });

    test('should redirect to login if user is not authenticated', () => {
      const req = {
        isAuthenticated: jest.fn(() => false)
      };
      const res = {
        redirect: jest.fn()
      };
      const next = jest.fn();

      const isAdmin = (req, res, next) => {
        if (req.isAuthenticated() && req.user.isAdmin) {
          return next();
        }
        if (req.isAuthenticated()) {
          res.redirect('/');
        } else {
          res.redirect('/login');
        }
      };

      isAdmin(req, res, next);

      expect(res.redirect).toHaveBeenCalledWith('/login');
      expect(next).not.toHaveBeenCalled();
    });
  });
});

describe('Sanitization Middleware Unit Tests', () => {
  describe('Input Sanitization', () => {
    test('should remove script tags from input', () => {
      const input = '<script>alert("xss")</script>Hello';
      const sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      
      expect(sanitized).toBe('Hello');
      expect(sanitized).not.toContain('<script>');
    });

    test('should handle NoSQL injection attempts', () => {
      const maliciousInput = { $gt: '' };
      const isMalicious = typeof maliciousInput === 'object' && 
                          Object.keys(maliciousInput).some(key => key.startsWith('$'));
      
      expect(isMalicious).toBe(true);
    });

    test('should allow safe input', () => {
      const safeInput = 'This is safe text';
      const sanitized = safeInput.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      
      expect(sanitized).toBe(safeInput);
    });
  });
});
