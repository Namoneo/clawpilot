import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Users table
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'email', type: 'varchar', isUnique: true },
          { name: 'password', type: 'varchar' },
          { name: 'name', type: 'varchar' },
          { name: 'plan', type: 'varchar', default: 'free' },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true
    );

    // Agents table
    await queryRunner.createTable(
      new Table({
        name: 'agents',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'user_id', type: 'int' },
          { name: 'name', type: 'varchar' },
          { name: 'template_id', type: 'varchar', isNullable: true },
          { name: 'routing', type: 'jsonb', isNullable: true },
          { name: 'status', type: 'varchar', default: 'stopped' },
          { name: 'logs', type: 'text', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true
    );

    // Agent runs table
    await queryRunner.createTable(
      new Table({
        name: 'agent_runs',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'agent_id', type: 'int' },
          { name: 'status', type: 'varchar', default: 'running' },
          { name: 'tokens_used', type: 'int', default: 0 },
          { name: 'logs', type: 'text', isNullable: true },
          { name: 'started_at', type: 'timestamp', default: 'now()' },
          { name: 'finished_at', type: 'timestamp', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true
    );

    // API Keys table
    await queryRunner.createTable(
      new Table({
        name: 'api_keys',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'user_id', type: 'int' },
          { name: 'name', type: 'varchar' },
          { name: 'key_prefix', type: 'varchar' },
          { name: 'hashed_key', type: 'varchar' },
          { name: 'permissions', type: 'simple-array', isNullable: true },
          { name: 'active', type: 'boolean', default: true },
          { name: 'last_used_at', type: 'timestamp', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true
    );

    // Webhooks table
    await queryRunner.createTable(
      new Table({
        name: 'webhooks',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'user_id', type: 'int' },
          { name: 'url', type: 'varchar' },
          { name: 'events', type: 'simple-array', isNullable: true },
          { name: 'secret', type: 'varchar', isNullable: true },
          { name: 'active', type: 'boolean', default: true },
          { name: 'last_triggered_at', type: 'timestamp', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true
    );

    // Teams table
    await queryRunner.createTable(
      new Table({
        name: 'teams',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'name', type: 'varchar' },
          { name: 'plan', type: 'varchar', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true
    );

    // Team members table
    await queryRunner.createTable(
      new Table({
        name: 'team_members',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'team_id', type: 'int' },
          { name: 'user_id', type: 'int' },
          { name: 'role', type: 'varchar', default: 'member' },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true
    );

    // Audit logs table
    await queryRunner.createTable(
      new Table({
        name: 'audit_logs',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'user_id', type: 'int' },
          { name: 'action', type: 'varchar' },
          { name: 'details', type: 'jsonb', isNullable: true },
          { name: 'ip_address', type: 'varchar', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true
    );

    // Documents table
    await queryRunner.createTable(
      new Table({
        name: 'documents',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'user_id', type: 'int' },
          { name: 'name', type: 'varchar' },
          { name: 'content', type: 'text' },
          { name: 'type', type: 'varchar' },
          { name: 'metadata', type: 'jsonb', isNullable: true },
          { name: 'status', type: 'varchar', default: 'pending' },
          { name: 'chunks', type: 'int', isNullable: true },
          { name: 'tokens', type: 'int', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true
    );

    // Create indexes
    await queryRunner.createIndex('agents', new TableIndex({ name: 'IDX_agents_user_id', columnNames: ['user_id'] }));
    await queryRunner.createIndex('agent_runs', new TableIndex({ name: 'IDX_agent_runs_agent_id', columnNames: ['agent_id'] }));
    await queryRunner.createIndex('api_keys', new TableIndex({ name: 'IDX_api_keys_user_id', columnNames: ['user_id'] }));
    await queryRunner.createIndex('audit_logs', new TableIndex({ name: 'IDX_audit_logs_user_id', columnNames: ['user_id'] }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('documents');
    await queryRunner.dropTable('audit_logs');
    await queryRunner.dropTable('team_members');
    await queryRunner.dropTable('teams');
    await queryRunner.dropTable('webhooks');
    await queryRunner.dropTable('api_keys');
    await queryRunner.dropTable('agent_runs');
    await queryRunner.dropTable('agents');
    await queryRunner.dropTable('users');
  }
}
