import { Component, Input, Output, EventEmitter, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface NavTab {
  id: string;
  label: string;
  icon?: string;
  active?: boolean;
  disabled?: boolean;
}

@Component({
  selector: 'app-nav-tabs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './nav-tabs.component.html',
  styleUrls: ['./nav-tabs.component.css']
})
export class NavTabsComponent implements OnInit, AfterViewInit {
  @Input() tabs: NavTab[] = [];
  @Input() colorVariant: string = 'tabs-blue'; // tabs-blue, tabs-green, tabs-purple, tabs-orange
  @Input() size: string = 'normal'; // normal, small, large
  @Output() tabChange = new EventEmitter<NavTab>();
  
  @ViewChild('tabsContainer') tabsContainer!: ElementRef<HTMLUListElement>;
  
  activeIndex = 0;

  ngOnInit() {
    // Assicurati che almeno una tab sia attiva
    if (this.tabs.length > 0 && !this.tabs.some(tab => tab.active)) {
      this.tabs[0].active = true;
    }
    
    // Trova l'indice della tab attiva
    this.activeIndex = this.tabs.findIndex(tab => tab.active);
    if (this.activeIndex === -1) {
      this.activeIndex = 0;
    }
  }

  ngAfterViewInit() {
    // Aggiorna la posizione dell'indicatore
    setTimeout(() => this.updateActiveIndex(), 100);
  }

  selectTab(selectedTab: NavTab, index: number) {
    if (selectedTab.disabled) return;
    
    // Deseleziona tutte le tabs
    this.tabs.forEach(tab => tab.active = false);
    
    // Seleziona la tab cliccata
    selectedTab.active = true;
    this.activeIndex = index;
    
    // Aggiorna l'indicatore
    this.updateActiveIndex();
    
    // Emetti l'evento di cambio tab
    this.tabChange.emit(selectedTab);
  }

  private updateActiveIndex() {
    if (this.tabsContainer) {
      const container = this.tabsContainer.nativeElement;
      container.style.setProperty('--active-index', this.activeIndex.toString());
      container.style.setProperty('--tab-count', this.tabs.length.toString());
    }
  }

  get containerClasses(): string {
    return `nav-tabs-animated ${this.colorVariant} size-${this.size}`;
  }
}