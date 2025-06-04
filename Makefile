.PHONY: anvil deploy dev test_deployed_contract test_number

# Default Anvil private key for testing
PK=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
RPC_URL=http://localhost:8546
DEPLOY_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3

anvil:
	@echo "Starting Anvil..."
	cd contract && anvil --port 8546

deploy:
	@echo "Deploying contract..."
	@cd contract && PRIVATE_KEY=$(PK) forge script script/Deploy.s.sol --rpc-url $(RPC_URL) --broadcast

dev:
	@echo "Starting frontend..."
	@cd frontend && pnpm dev

# Manual testing
test_deployed_contract:
	@echo "Is there code at the address?"
	@cd contract && cast code $(DEPLOY_ADDRESS) --rpc-url ${RPC_URL}

test_number:
	@echo "Get number"
	@cd contract && cast call $(DEPLOY_ADDRESS) "number()" --rpc-url ${RPC_URL}
