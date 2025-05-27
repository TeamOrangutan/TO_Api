// src/@types/index.d.ts

import * as express from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
      };
    }
  }
}
