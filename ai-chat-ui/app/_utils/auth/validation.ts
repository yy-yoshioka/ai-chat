import { PASSWORD_MIN_LENGTH } from '@/app/_config/auth/constants';

/** 入力チェック系ユーティリティ ------------------------- */

/** メール書式の簡易検証 */
export const isValidEmail = (email: string): boolean => /^[\w.+-]+@[\w.-]+\.[\w.-]+$/.test(email);

/** パスワード長さチェック */
export const isValidPassword = (pwd: string): boolean => pwd.length >= PASSWORD_MIN_LENGTH;
