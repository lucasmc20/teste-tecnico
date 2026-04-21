import { test, expect } from '@playwright/test';

// Requer: app rodando em localhost:3000 e back-end em localhost:3333.
// As variáveis ADMIN_USER / ADMIN_PASS devem estar configuradas no back-end.
const ADMIN = { user: process.env.ADMIN_USER ?? 'admin', pass: process.env.ADMIN_PASS ?? 'admin' };

test.describe('Fluxo completo de itens', () => {
  test('exibe lista na página inicial (SSR)', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /itens cadastrados/i })).toBeVisible();
  });

  test('login com credenciais inválidas mostra erro', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /entrar/i }).click();
    await page.getByLabel(/usuário/i).fill('errado');
    await page.getByLabel(/senha/i).fill('errada');
    await page.getByRole('button', { name: /entrar/i }).last().click();
    await expect(page.getByText(/credenciais inválidas/i)).toBeVisible();
  });

  test('CRUD completo — criar, editar e excluir', async ({ page }) => {
    await page.goto('/');

    // Login
    await page.getByRole('button', { name: /entrar/i }).click();
    await page.getByLabel(/usuário/i).fill(ADMIN.user);
    await page.getByLabel(/senha/i).fill(ADMIN.pass);
    await page.getByRole('button', { name: /entrar/i }).last().click();
    await expect(page.getByRole('button', { name: /sair/i })).toBeVisible();

    // Criar item
    const itemName = `Playwright Item ${Date.now()}`;
    await page.getByLabel(/nome/i).fill(itemName);
    await page.getByLabel(/preço/i).fill('99.9');
    await page.getByLabel(/estoque/i).fill('5');
    await page.getByRole('button', { name: /adicionar/i }).click();
    await expect(page.getByText(itemName)).toBeVisible();

    // Editar item
    await page.getByRole('button', { name: /editar/i }).first().click();
    await page.getByLabel(/nome/i).clear();
    await page.getByLabel(/nome/i).fill(`${itemName} editado`);
    await page.getByRole('button', { name: /salvar/i }).click();
    await expect(page.getByText(`${itemName} editado`)).toBeVisible();

    // Excluir item
    await page.getByRole('button', { name: /excluir/i }).first().click();
    // Confirmar no modal
    await page.getByRole('button', { name: /confirmar/i }).click();
    await expect(page.getByText(`${itemName} editado`)).not.toBeVisible();
  });

  test('busca com debounce filtra a lista', async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder(/buscar/i).fill('xyz_inexistente_123');
    // Aguarda debounce + request
    await page.waitForTimeout(600);
    await expect(page.getByText(/0 itens/i)).toBeVisible();
  });
});
