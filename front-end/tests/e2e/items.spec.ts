import { test, expect } from '@playwright/test';

// Requer: app rodando em localhost:3000 e back-end em localhost:3333.
// As variáveis ADMIN_USER / ADMIN_PASS devem estar configuradas no back-end.
const ADMIN = { user: process.env.ADMIN_USER ?? 'admin', pass: process.env.ADMIN_PASS ?? 'admin' };

/** Faz login via página /login e aguarda redirecionamento para o painel. */
async function loginAs(page: import('@playwright/test').Page, user: string, pass: string) {
  await page.goto('/login');
  await page.getByLabel(/usuário/i).fill(user);
  await page.getByLabel(/senha/i).fill(pass);
  await page.getByRole('button', { name: /entrar/i }).click();
  await expect(page.getByRole('heading', { name: /itens cadastrados/i })).toBeVisible();
}

test.describe('Fluxo completo de itens', () => {
  test('redireciona para login ao acessar / sem autenticação', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: /entre para acessar/i })).toBeVisible();
  });

  test('exibe lista após login bem-sucedido', async ({ page }) => {
    await loginAs(page, ADMIN.user, ADMIN.pass);
    await expect(page.getByRole('heading', { name: /itens cadastrados/i })).toBeVisible();
  });

  test('login com credenciais inválidas mostra erro', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/usuário/i).fill('errado');
    await page.getByLabel(/senha/i).fill('errada');
    await page.getByRole('button', { name: /entrar/i }).click();
    await expect(page.getByText(/credenciais inválidas/i)).toBeVisible();
  });

  test('CRUD completo — criar, editar e excluir', async ({ page }) => {
    await loginAs(page, ADMIN.user, ADMIN.pass);

    // Criar item
    const itemName = `Playwright Item ${Date.now()}`;
    await page.getByLabel(/nome/i).fill(itemName);
    await page.getByLabel(/preço/i).fill('9990');
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
    await loginAs(page, ADMIN.user, ADMIN.pass);
    await page.getByPlaceholder(/buscar/i).fill('xyz_inexistente_123');
    // Aguarda debounce + request
    await page.waitForTimeout(600);
    await expect(page.getByText(/0 itens/i)).toBeVisible();
  });
});
