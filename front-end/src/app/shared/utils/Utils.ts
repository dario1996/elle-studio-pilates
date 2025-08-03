/**
 * Funzione helper per calcolare gli spazi di un elemento
 */
function getElementSpacing(element: HTMLElement): number {
  if (!element) return 0;
  
  const style = window.getComputedStyle(element);
  const padding = (parseFloat(style.paddingTop) || 0) + (parseFloat(style.paddingBottom) || 0);
  const margin = (parseFloat(style.marginTop) || 0) + (parseFloat(style.marginBottom) || 0);
  const border = (parseFloat(style.borderTopWidth) || 0) + (parseFloat(style.borderBottomWidth) || 0);
  
  return padding + margin + border;
}

/**
 * Versione ottimizzata per il calcolo del pageSize con gestione responsive
 */
export function calcolaPageSizeOptimized(
  container: HTMLElement,
  minRows: number = 3,
  maxRows: number = 50
): number {
  // Se il container non è visibile, usa valori di fallback
  if (!container || container.offsetHeight === 0) {
    return minRows;
  }

  const elements = {
    pageContainer: container.querySelector('.page-container') as HTMLElement,
    pageHeader: container.querySelector('.page-header') as HTMLElement,
    pageContent: container.querySelector('.page-content') as HTMLElement,
    filtriBox: container.querySelector('.filtri-generici-container') as HTMLElement,
    tableHeader: container.querySelector('.table-header') as HTMLElement,
    tableFooter: container.querySelector('.table-footer') as HTMLElement,
    tableBody: container.querySelector('tbody') as HTMLElement,
  };

  // Calcola l'altezza media delle righe
  let rowHeight = 40; // Default per righe compatte
  if (elements.tableBody) {
    const dataRows = Array.from(elements.tableBody.children).filter(row => 
      row.tagName === 'TR' && 
      !row.classList.contains('empty-rows') && 
      (row as HTMLElement).offsetHeight > 0
    ) as HTMLElement[];
    
    if (dataRows.length > 0) {
      const avgHeight = dataRows.reduce((sum, row) => sum + row.offsetHeight, 0) / dataRows.length;
      rowHeight = Math.ceil(avgHeight);
    }
  }

  // Calcola tutte le altezze fisse
  const fixedHeights = {
    header: elements.tableHeader?.offsetHeight || 0,
    footer: elements.tableFooter?.offsetHeight || 0,
    filtri: elements.filtriBox?.offsetHeight || 0,
  };

  // Calcola tutti gli spazi (padding, margin, border)
  const totalSpacing = Object.values(elements).reduce((total, element) => 
    total + getElementSpacing(element), 0
  );

  // Buffer di sicurezza per evitare overflow
  const safetyBuffer = Math.max(20, window.innerHeight * 0.02); // 2% dell'altezza della finestra

  // Calcola l'altezza disponibile
  const containerHeight = container.clientHeight;
  const usedHeight = Object.values(fixedHeights).reduce((sum, height) => sum + height, 0);
  const availableHeight = containerHeight - usedHeight - totalSpacing - safetyBuffer;

  // Calcola il pageSize
  const calculatedPageSize = Math.floor(availableHeight / rowHeight);

  // Applica i limiti min/max
  const finalPageSize = Math.max(minRows, Math.min(calculatedPageSize, maxRows));

  // Debug dettagliato (rimuovi in produzione)
  // if (process.env['NODE_ENV'] === 'development') {
  //   console.log('📊 PageSize Calculation:', {
  //     containerHeight,
  //     rowHeight,
  //     fixedHeights,
  //     totalSpacing,
  //     safetyBuffer,
  //     availableHeight,
  //     calculatedPageSize,
  //     finalPageSize
  //   });
  // }

  return finalPageSize;
}