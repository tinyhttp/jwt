import { suite } from 'uvu'
import { ServerResponse as Response } from 'http'
import fs from 'fs'
import jsonwebtoken, { Algorithm } from 'jsonwebtoken'
import expect from 'expect'
import { jwt, Request } from '../src/index'

const it = suite('JWT tests')

const req = {} as Request
const res = {} as Response

it.before.each(() => {
  req.headers = {}
  req.user = {}
})

it('should work using default algorithm if authorization header is valid jsonwebtoken', () => {
  const secret = 'shhhhhh'
  const token = jsonwebtoken.sign({ foo: 'bar' }, secret)

  req.headers.authorization = 'Bearer ' + token

  jwt({ secret: secret })(req, res, () => {
    expect(req.user.foo).toBe('bar')
  })
})

it('should work with different HMAC algorithms', () => {
  const algorithms: Algorithm[] = ['HS512', 'HS256', 'HS384']
  const secret = 'shhhhhh'

  algorithms.forEach(algorithm => {
    const token = jsonwebtoken.sign({ foo: 'bar' }, secret, { algorithm })
    req.headers.authorization = 'Bearer ' + token

    jwt({ secret: secret, algorithm })(req, res, () => {
      expect(req.user.foo).toBe('bar')
    })
  });
})

it('should work if authorization header is valid with a buffer secret', () => {
  const secret = Buffer.from('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', 'base64')
  const token = jsonwebtoken.sign({ foo: 'bar' }, secret)

  req.headers.authorization = 'Bearer ' + token

  jwt({ secret: secret.toString(), algorithm: 'HS256' })(req, res, () => {
    expect(req.user.foo).toBe('bar')
  })
})

it('should handle private key encryption', () => {
  const privateKey = fs.readFileSync('tests/fixtures/private', { encoding: 'utf-8' })
  const publicKey = fs.readFileSync('tests/fixtures/public', { encoding: 'utf-8' })

  req.headers.authorization = 'Bearer ' + jsonwebtoken.sign({ foo: 'bar' }, privateKey, { algorithm: 'RS256' })

  jwt({ secret: [privateKey, publicKey], algorithm: 'RS256' })(req, res, () => {
    expect(req.user.foo).toBe('bar')
  })
})

it('should work with different RSA algorithms', () => {
  const algorithms: Algorithm[] = ['RS256', 'RS384', 'RS512']
  const privateKey = fs.readFileSync('tests/fixtures/private', { encoding: 'utf-8' })
  const publicKey = fs.readFileSync('tests/fixtures/public', { encoding: 'utf-8' })

  algorithms.forEach(algorithm => {
    req.headers.authorization = 'Bearer ' + jsonwebtoken.sign({ foo: 'bar' }, privateKey, { algorithm: 'RS256' })

    jwt({ secret: [privateKey, publicKey], algorithm })(req, res, () => {
      expect(req.user.foo).toBe('bar')
    })
  });
})

it('should not work with malformed input', () => {
  const fake_secret = 'notmuchsecret'
  const true_secret = 'verysecret'
  const token = jsonwebtoken.sign({ foo: 'bar' }, fake_secret)

  req.headers.authorization = 'Bearer ' + token

  jwt({ secret: true_secret })(req, res, () => {
    expect(req.user.foo).toBeUndefined()
  })
})

it('should not work if authorization header is missing', () => {
  const secret = 'shhhhhh'

  jwt({ secret: secret })(req, res, () => {
    expect(req.user.foo).toBeUndefined()
  })
})

it.run()
