const TimeCalculationService = require('../../services/TimeCalculationService');
const ColombianLaborLawService = require('../../services/ColombianLaborLawService');

describe('TimeCalculationService.calcularSesion', () => {
  const schedule = (day, minutes) => ({
    diaDescansoObligatorio: 7,
    minutosOrdinariosPorDia: new Map([[String(day), minutes]])
  });

  test('classifies overtime against the employee daily schedule', () => {
    const result = TimeCalculationService.calcularSesion({
      entrada: '2025-01-07T11:00:00.000Z',
      salida: '2025-01-07T20:00:00.000Z',
      horario: schedule(2, 480)
    });

    expect(result.estadoCalculo).toBe('calculado');
    expect(result.horasOrdinarias.total.minutos).toBe(480);
    expect(result.horasExtras.diurnas.minutos).toBe(60);
    expect(result.tiempoTotal.minutos).toBe(540);
  });

  test('uses the legal night-work transition in Colombia local time', () => {
    const result = TimeCalculationService.calcularSesion({
      entrada: '2025-12-26T05:00:00.000Z',
      salida: '2025-12-26T07:30:00.000Z',
      horario: schedule(5, 240)
    });

    expect(result.horasOrdinarias.nocturnas.minutos).toBe(150);
    expect(result.recargos.nocturnoOrdinario.porcentaje).toBe(35);
  });

  test('marks classification pending when there is no effective schedule', () => {
    const result = TimeCalculationService.calcularSesion({
      entrada: '2025-01-06T11:00:00.000Z',
      salida: '2025-01-06T12:00:00.000Z',
      horario: null
    });

    expect(result.estadoCalculo).toBe('pendiente_horario');
    expect(result.tiempoTotal.minutos).toBe(60);
  });
});

describe('ColombianLaborLawService.obtenerReglasVigentes', () => {
  test.each([
    ['2025-07-14T12:00:00.000Z', 46, 80],
    ['2025-07-15T12:00:00.000Z', 44, 80],
    ['2025-12-25T12:00:00.000Z', 44, 80]
  ])('returns effective statutory values for %s', (date, weeklyLimit, restPremium) => {
    const rules = ColombianLaborLawService.obtenerReglasVigentes(date);
    expect(rules.maxHorasSemanales).toBe(weeklyLimit);
    expect(rules.recargoDescanso).toBe(restPremium);
  });
});
