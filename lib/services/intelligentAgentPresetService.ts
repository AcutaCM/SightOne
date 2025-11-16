/**
 * Intelligent Agent Preset Service
 * 
 * This service manages the Tello Intelligent Agent preset assistant.
 * It handles creation, updates, and initialization of the preset on system startup.
 */

import { assistantApiClient } from '@/lib/api/assistantApiClient';
import { Assistant, CreateAssistantRequest, UpdateAssistantRequest } from '@/types/assistant';
import { logger } from '@/lib/logger/logger';
import {
  INTELLIGENT_AGENT_ID,
  INTELLIGENT_AGENT_METADATA,
  INTELLIGENT_AGENT_PROMPT,
  INTELLIGENT_AGENT_DESCRIPTION,
} from '@/lib/constants/intelligentAgentPreset';
import {
  IntelligentAgentError,
  IntelligentAgentErrorType,
  ErrorSeverity,
  intelligentAgentErrorLogger,
  parseError,
} from '@/lib/errors';
import { intelligentAgentPresetCache } from '@/lib/cache/intelligentAgentPresetCache';

/**
 * Service class for managing the Intelligent Agent preset
 */
export class IntelligentAgentPresetService {
  /**
   * Check if the intelligent agent preset exists
   * Uses cache when available to reduce API calls
   * 
   * @param useCache - Whether to check cache first (default: true)
   * @returns Promise resolving to true if preset exists, false otherwise
   */
  async checkPresetExists(useCache: boolean = true): Promise<boolean> {
    try {
      logger.info('Checking if intelligent agent preset exists', { id: INTELLIGENT_AGENT_ID, useCache }, 'IntelligentAgentPresetService');
      
      // Try cache first if enabled
      if (useCache) {
        const cached = await intelligentAgentPresetCache.get();
        if (cached) {
          logger.info('Preset found in cache', { id: INTELLIGENT_AGENT_ID }, 'IntelligentAgentPresetService');
          return true;
        }
      }
      
      // Check with API
      const assistant = await assistantApiClient.getById(INTELLIGENT_AGENT_ID, false);
      const exists = !!assistant;
      
      // Cache the result if found
      if (exists && assistant) {
        await intelligentAgentPresetCache.set(assistant);
      }
      
      logger.info(
        `Intelligent agent preset ${exists ? 'exists' : 'does not exist'}`,
        { id: INTELLIGENT_AGENT_ID },
        'IntelligentAgentPresetService'
      );
      
      return exists;
    } catch (error) {
      const agentError = parseError(error, { operation: 'checkPresetExists', id: INTELLIGENT_AGENT_ID });
      intelligentAgentErrorLogger.logError(agentError);
      logger.error('Error checking preset existence', { id: INTELLIGENT_AGENT_ID, error }, 'IntelligentAgentPresetService');
      // Return false on error to trigger creation attempt
      return false;
    }
  }

  /**
   * Create the intelligent agent preset
   * Automatically caches the created preset
   * 
   * @returns Promise resolving to the created assistant
   */
  async createPreset(): Promise<Assistant> {
    try {
      logger.info('Creating intelligent agent preset', { id: INTELLIGENT_AGENT_ID }, 'IntelligentAgentPresetService');

      const presetData: CreateAssistantRequest = {
        title: INTELLIGENT_AGENT_METADATA.title,
        desc: INTELLIGENT_AGENT_DESCRIPTION,
        emoji: INTELLIGENT_AGENT_METADATA.emoji,
        prompt: INTELLIGENT_AGENT_PROMPT,
        tags: INTELLIGENT_AGENT_METADATA.tags,
        category: INTELLIGENT_AGENT_METADATA.category,
        isPublic: INTELLIGENT_AGENT_METADATA.isPublic,
      };

      const assistant = await assistantApiClient.create(presetData);
      
      // Cache the created preset
      await intelligentAgentPresetCache.set(assistant);
      
      logger.info('Intelligent agent preset created and cached successfully', { id: assistant.id }, 'IntelligentAgentPresetService');
      console.log('[IntelligentAgentPresetService] ✅ Preset created successfully:', assistant.id);
      
      return assistant;
    } catch (error) {
      const agentError = parseError(error, { operation: 'createPreset', id: INTELLIGENT_AGENT_ID });
      intelligentAgentErrorLogger.logError(agentError);
      logger.error('Failed to create intelligent agent preset', { error }, 'IntelligentAgentPresetService');
      console.error('[IntelligentAgentPresetService] ❌ Failed to create preset:', error);
      throw agentError;
    }
  }

  /**
   * Update the intelligent agent preset
   * Automatically updates the cache with new data
   * 
   * @param updates - Partial updates to apply to the preset
   * @returns Promise resolving to the updated assistant
   */
  async updatePreset(updates: Partial<UpdateAssistantRequest>): Promise<Assistant> {
    try {
      logger.info('Updating intelligent agent preset', { id: INTELLIGENT_AGENT_ID, updates }, 'IntelligentAgentPresetService');
      
      // Get current version
      const current = await assistantApiClient.getById(INTELLIGENT_AGENT_ID, false);
      
      if (!current) {
        const error = new IntelligentAgentError(
          IntelligentAgentErrorType.CONFIG_MISSING,
          '智能代理预设不存在',
          'Intelligent agent preset not found',
          'Intelligent agent preset not found in database',
          ErrorSeverity.HIGH,
          false
        );
        intelligentAgentErrorLogger.logError(error);
        throw error;
      }

      // Merge updates with version
      const updateData: UpdateAssistantRequest = {
        ...updates,
        version: current.version,
      };

      const assistant = await assistantApiClient.update(INTELLIGENT_AGENT_ID, updateData);
      
      // Update cache with new data
      await intelligentAgentPresetCache.set(assistant);
      
      logger.info('Intelligent agent preset updated and cached successfully', { id: assistant.id }, 'IntelligentAgentPresetService');
      console.log('[IntelligentAgentPresetService] ✅ Preset updated successfully:', assistant.id);
      
      return assistant;
    } catch (error) {
      const agentError = error instanceof IntelligentAgentError ? error : parseError(error, { 
        operation: 'updatePreset', 
        id: INTELLIGENT_AGENT_ID,
        updates 
      });
      intelligentAgentErrorLogger.logError(agentError);
      logger.error('Failed to update intelligent agent preset', { error }, 'IntelligentAgentPresetService');
      console.error('[IntelligentAgentPresetService] ❌ Failed to update preset:', error);
      throw agentError;
    }
  }

  /**
   * Initialize the intelligent agent preset on system startup
   * Creates the preset if it doesn't exist, otherwise logs that it exists
   * 
   * This method is designed to be called during application initialization
   * and will not throw errors to avoid blocking system startup
   */
  async initializePreset(): Promise<void> {
    try {
      console.log('[IntelligentAgentPresetService] 🚀 Initializing intelligent agent preset...');
      logger.info('Initializing intelligent agent preset', {}, 'IntelligentAgentPresetService');

      const exists = await this.checkPresetExists();

      if (!exists) {
        console.log('[IntelligentAgentPresetService] 📝 Preset does not exist, creating...');
        await this.createPreset();
        console.log('[IntelligentAgentPresetService] ✅ Intelligent agent preset created successfully');
      } else {
        console.log('[IntelligentAgentPresetService] ✅ Intelligent agent preset already exists');
        logger.info('Intelligent agent preset already exists', { id: INTELLIGENT_AGENT_ID }, 'IntelligentAgentPresetService');
      }
    } catch (error) {
      // Parse and log error with full context
      const agentError = parseError(error, { operation: 'initializePreset', id: INTELLIGENT_AGENT_ID });
      intelligentAgentErrorLogger.logError(agentError);
      
      // Log error but don't throw to avoid blocking system startup
      logger.error('Failed to initialize intelligent agent preset', { error }, 'IntelligentAgentPresetService');
      console.error('[IntelligentAgentPresetService] ⚠️ Failed to initialize preset (non-blocking):', error);
      // User can manually create the preset later if needed
    }
  }

  /**
   * Get the intelligent agent preset
   * Uses cache when available and periodically checks for updates
   * 
   * @param forceRefresh - Force fetch from API, bypassing cache
   * @returns Promise resolving to the assistant or null if not found
   */
  async getPreset(forceRefresh: boolean = false): Promise<Assistant | null> {
    try {
      logger.info('Getting intelligent agent preset', { id: INTELLIGENT_AGENT_ID, forceRefresh }, 'IntelligentAgentPresetService');

      // Check if we should verify with server (every 24 hours)
      const shouldCheck = forceRefresh || await intelligentAgentPresetCache.shouldCheckForUpdates();

      if (!shouldCheck) {
        // Return cached version if available
        const cached = await intelligentAgentPresetCache.get();
        if (cached) {
          logger.info(
            'Returning cached preset (no update check needed)', 
            { id: INTELLIGENT_AGENT_ID }, 
            'IntelligentAgentPresetService'
          );
          return cached;
        }
      }

      // Fetch from API
      logger.info('Fetching preset from API', { id: INTELLIGENT_AGENT_ID }, 'IntelligentAgentPresetService');
      const assistant = await assistantApiClient.getById(INTELLIGENT_AGENT_ID, false);

      if (assistant) {
        // Update cache
        await intelligentAgentPresetCache.set(assistant);
        await intelligentAgentPresetCache.updateLastChecked();
        logger.info('Preset fetched and cached', { id: INTELLIGENT_AGENT_ID }, 'IntelligentAgentPresetService');
      } else {
        logger.warn('Preset not found on server', { id: INTELLIGENT_AGENT_ID }, 'IntelligentAgentPresetService');
      }

      return assistant;
    } catch (error) {
      const agentError = parseError(error, { operation: 'getPreset', id: INTELLIGENT_AGENT_ID });
      intelligentAgentErrorLogger.logError(agentError);
      logger.error('Failed to get preset', { error }, 'IntelligentAgentPresetService');
      
      // Try to return cached version as fallback
      try {
        const cached = await intelligentAgentPresetCache.get();
        if (cached) {
          logger.info('Returning cached preset as fallback', { id: INTELLIGENT_AGENT_ID }, 'IntelligentAgentPresetService');
          return cached;
        }
      } catch (cacheError) {
        logger.error('Failed to get cached preset as fallback', { error: cacheError }, 'IntelligentAgentPresetService');
      }

      return null;
    }
  }

  /**
   * Refresh the preset with latest configuration
   * Useful for updating the preset after changes to constants
   * Clears cache to ensure fresh data
   * 
   * @returns Promise resolving when refresh is complete
   */
  async refreshPreset(): Promise<void> {
    try {
      logger.info('Refreshing intelligent agent preset', { id: INTELLIGENT_AGENT_ID }, 'IntelligentAgentPresetService');
      console.log('[IntelligentAgentPresetService] 🔄 Refreshing preset...');

      // Clear cache to force fresh fetch
      await intelligentAgentPresetCache.delete();

      const exists = await this.checkPresetExists(false); // Don't use cache

      if (exists) {
        await this.updatePreset({
          title: INTELLIGENT_AGENT_METADATA.title,
          desc: INTELLIGENT_AGENT_DESCRIPTION,
          emoji: INTELLIGENT_AGENT_METADATA.emoji,
          prompt: INTELLIGENT_AGENT_PROMPT,
          tags: INTELLIGENT_AGENT_METADATA.tags,
          category: INTELLIGENT_AGENT_METADATA.category,
          isPublic: INTELLIGENT_AGENT_METADATA.isPublic,
        });
        console.log('[IntelligentAgentPresetService] ✅ Preset refreshed successfully');
      } else {
        await this.createPreset();
        console.log('[IntelligentAgentPresetService] ✅ Preset created during refresh');
      }
    } catch (error) {
      const agentError = parseError(error, { operation: 'refreshPreset', id: INTELLIGENT_AGENT_ID });
      intelligentAgentErrorLogger.logError(agentError);
      logger.error('Failed to refresh intelligent agent preset', { error }, 'IntelligentAgentPresetService');
      console.error('[IntelligentAgentPresetService] ❌ Failed to refresh preset:', error);
      throw agentError;
    }
  }

  /**
   * Clear the preset cache
   * Useful for debugging or forcing a fresh fetch
   */
  async clearCache(): Promise<void> {
    try {
      await intelligentAgentPresetCache.clear();
      logger.info('Preset cache cleared', {}, 'IntelligentAgentPresetService');
      console.log('[IntelligentAgentPresetService] 🗑️ Cache cleared');
    } catch (error) {
      logger.error('Failed to clear preset cache', { error }, 'IntelligentAgentPresetService');
      console.error('[IntelligentAgentPresetService] ❌ Failed to clear cache:', error);
    }
  }
}

// Export singleton instance
export const intelligentAgentPresetService = new IntelligentAgentPresetService();
