import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatusBadgeService, StatusBadgeConfig } from '../../services/status-badge.service';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-badge.component.html',
  styleUrls: ['./status-badge.component.css']
})
export class StatusBadgeComponent {
  @Input() value!: string;
  @Input() statusType: string = 'general';
  @Input() customConfig?: StatusBadgeConfig[];

  constructor(private statusBadgeService: StatusBadgeService) {}

  get config(): StatusBadgeConfig {
    if (this.customConfig) {
      const config = this.customConfig.find(c => c.value === this.value);
      if (config) {
        return config;
      }
    }
    
    return this.statusBadgeService.getStatusBadgeConfig(this.value, this.statusType);
  }
}
