# Testing Guide - receipt-wise-hub

## Configuración de Pruebas

Este proyecto utiliza:
- **Vitest** para pruebas unitarias y de integración
- **@testing-library/react** para pruebas de componentes
- **Playwright** para pruebas end-to-end
- **@vitest/coverage-v8** para reportes de cobertura

## Comandos Disponibles

```bash
# Ejecutar pruebas unitarias
npm run test

# Ejecutar pruebas en modo watch
npm run test:watch

# Generar reporte de cobertura
npm run test:coverage

# Ejecutar pruebas E2E
npm run e2e

# Ejecutar pruebas E2E con interfaz
npm run e2e:headed
```

## Estructura de Pruebas

```
src/
  lib/__tests__/          # Pruebas de utilidades y lógica
  components/__tests__/   # Pruebas de componentes UI
  pages/__tests__/        # Pruebas de páginas (futuro)
tests/
  e2e/                    # Pruebas end-to-end con Playwright
```

## Estándares de Calidad

### Cobertura Mínima
- **Unit tests**: >= 20% para código crítico
- **E2E tests**: Happy paths principales cubiertos

### Buenas Prácticas
1. Usar `data-testid` para elementos complejos de seleccionar
2. Probar comportamiento, no implementación
3. Mantener tests independientes y determinísticos
4. Usar mocks para dependencias externas

### Ejemplos de Testing

#### Prueba de Componente
```typescript
test('renders button with correct text', () => {
  const { getByRole } = render(<Button>Click me</Button>)
  expect(getByRole('button')).toHaveTextContent('Click me')
})
```

#### Prueba de Función
```typescript
test('isAdmin returns correct value', () => {
  const adminUser = { role: 'ADMIN', ... }
  expect(isAdmin(adminUser)).toBe(true)
})
```

#### Prueba E2E
```typescript
test('user can login successfully', async ({ page }) => {
  await page.goto('/auth')
  await page.fill('input[type="email"]', 'test@example.com')
  await page.fill('input[type="password"]', 'password123')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL('/dashboard')
})
```

## CI/CD Integration

Las pruebas se ejecutan automáticamente en:
- **Pre-commit** (via Husky): Pruebas relacionadas con archivos modificados
- **GitHub Actions**: Suite completa en cada PR y push a main
- **Pull Requests**: Status checks obligatorios antes de merge

## Troubleshooting

### Problemas Comunes
1. **Tests lentos**: Usar `vi.fn()` para mocks en lugar de objetos reales
2. **Flaky tests**: Asegurar cleanup entre tests con `afterEach`
3. **DOM errors**: Verificar que setup.ts esté configurado correctamente

### Debug Tests
```bash
# Ver output detallado
npm run test -- --reporter=verbose

# Ejecutar test específico
npm run test -- auth.test.ts

# Debug con breakpoints
npm run test:watch
```