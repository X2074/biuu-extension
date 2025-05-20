// utils/tokenService.ts
import Web3 from 'web3';

export class TokenService {
    private web3: Web3;

    constructor(provider: string) {
        this.web3 = new Web3(provider);
    }

    // 检查是否是 ERC20 合约
    public async isERC20Contract(contractAddress: string): Promise<boolean> {
        try {
            const erc20Abi = [
                {
                    constant: true,
                    inputs: [{ name: "_owner", type: "address" }],
                    name: "balanceOf",
                    outputs: [{ name: "balance", type: "uint256" }],
                    payable: false,
                    stateMutability: "view",
                    type: "function"
                },
                {
                    constant: true,
                    inputs: [],
                    name: "decimals",
                    outputs: [{ name: "", type: "uint8" }],
                    payable: false,
                    stateMutability: "view",
                    type: "function"
                },
                {
                    constant: true,
                    inputs: [],
                    name: "symbol",
                    outputs: [{ name: "", type: "string" }],
                    payable: false,
                    stateMutability: "view",
                    type: "function"
                }
            ];

            const contract = new this.web3.eth.Contract(erc20Abi, contractAddress);
            
            // 获取多个特征来验证 ERC20
            const [balance, decimals, symbol] = await Promise.all([
                contract.methods.balanceOf(contractAddress).call(),
                contract.methods.decimals().call(),
                contract.methods.symbol().call()
            ]);

            // 验证特征是否符合 ERC20 标准
            return (
                parseInt(balance) >= 0 && // 余额必须是非负数
                parseInt(decimals) >= 0 && parseInt(decimals) <= 18 && // 小数位数在合理范围内
                typeof symbol === 'string' && symbol.length > 0 // 符号必须是有效的字符串
            );
        } catch (error) {
            return false;
        }
    }

    // 检查是否是 ERC721 合约
    public async isERC721Contract(contractAddress: string): Promise<boolean> {
        try {
            const erc721Abi = [
                {
                    constant: true,
                    inputs: [{ name: "_owner", type: "address" }],
                    name: "balanceOf",
                    outputs: [{ name: "balance", type: "uint256" }],
                    payable: false,
                    stateMutability: "view",
                    type: "function"
                },
                {
                    constant: true,
                    inputs: [{ name: "_owner", type: "address" }, { name: "_index", type: "uint256" }],
                    name: "tokenOfOwnerByIndex",
                    outputs: [{ name: "tokenId", type: "uint256" }],
                    payable: false,
                    stateMutability: "view",
                    type: "function"
                },
                {
                    constant: true,
                    inputs: [{ name: "_tokenId", type: "uint256" }],
                    name: "ownerOf",
                    outputs: [{ name: "owner", type: "address" }],
                    payable: false,
                    stateMutability: "view",
                    type: "function"
                }
            ];

            const contract = new this.web3.eth.Contract(erc721Abi, contractAddress);
            
            // 获取多个特征来验证 ERC721
            const [balance, tokenId] = await Promise.all([
                contract.methods.balanceOf(contractAddress).call(),
                contract.methods.tokenOfOwnerByIndex(contractAddress, 0).call()
            ]);

            // 验证特征是否符合 ERC721 标准
            return (
                parseInt(balance) >= 0 && // 余额必须是非负数
                parseInt(tokenId) >= 0 && // tokenId 必须是非负数
                await contract.methods.ownerOf(tokenId).call() === contractAddress // 验证 ownerOf 返回值
            );
        } catch (error) {
            return false;
        }
    }

    // 自动检测合约类型
    public async detectContractType(contractAddress: string): Promise<'ERC20' | 'ERC721' | 'UNKNOWN'> {
        try {
            // 验证合约地址格式
            if (!Web3.utils.isAddress(contractAddress)) {
                return 'UNKNOWN';
            }

            // 验证合约是否存在
            const code = await this.web3.eth.getCode(contractAddress);
            if (code === '0x') {
                return 'UNKNOWN';
            }

            // 检查合约特征
            const [isERC20, isERC721] = await Promise.all([
                this.isERC20Contract(contractAddress),
                this.isERC721Contract(contractAddress)
            ]);
            console.log(isERC20, isERC721);
            

            if (isERC20) {
                return 'ERC20';
            } else if (isERC721) {
                return 'ERC721';
            } else {
                return 'UNKNOWN';
            }
        } catch (error) {
            console.error('Error detecting contract type:', error);
            return 'UNKNOWN';
        }
    }


    // 获取 ERC20 代币余额
    public async getERC20Balance(contractAddress: string, userAddress: string): Promise<{ balance: string; decimals: number }> {
        try {
            const erc20Abi = [
                {
                    constant: true,
                    inputs: [{ name: "_owner", type: "address" }],
                    name: "balanceOf",
                    outputs: [{ name: "balance", type: "uint256" }],
                    payable: false,
                    stateMutability: "view",
                    type: "function"
                },
                {
                    constant: true,
                    inputs: [],
                    name: "decimals",
                    outputs: [{ name: "", type: "uint8" }],
                    payable: false,
                    stateMutability: "view",
                    type: "function"
                }
            ];

            const contract = new this.web3.eth.Contract(erc20Abi, contractAddress);
            const [balance, decimals] = await Promise.all([
                contract.methods.balanceOf(userAddress).call(),
                contract.methods.decimals().call()
            ]);

            return {
                balance: Web3.utils.fromWei(balance, 'ether'),
                decimals: parseInt(decimals),
                type: 'ERC20'
            };
        } catch (error) {
            throw new Error(`Failed to get ERC20 balance: ${error.message}`);
        }
    }

    // 获取 ERC721 NFT 余额
    public async getERC721Balance(contractAddress: string, userAddress: string): Promise<{ balance: number; tokens: Array<{ tokenId: string; tokenURI: string }> }> {
        try {
            const erc721Abi = [
                {
                    constant: true,
                    inputs: [{ name: "_owner", type: "address" }],
                    name: "balanceOf",
                    outputs: [{ name: "balance", type: "uint256" }],
                    payable: false,
                    stateMutability: "view",
                    type: "function"
                },
                {
                    constant: true,
                    inputs: [{ name: "_owner", type: "address" }, { name: "_index", type: "uint256" }],
                    name: "tokenOfOwnerByIndex",
                    outputs: [{ name: "tokenId", type: "uint256" }],
                    payable: false,
                    stateMutability: "view",
                    type: "function"
                },
                {
                    constant: true,
                    inputs: [{ name: "_tokenId", type: "uint256" }],
                    name: "tokenURI",
                    outputs: [{ name: "uri", type: "string" }],
                    payable: false,
                    stateMutability: "view",
                    type: "function"
                }
            ];

            const contract = new this.web3.eth.Contract(erc721Abi, contractAddress);
            const balance = await contract.methods.balanceOf(userAddress).call();
            const balanceNum = parseInt(balance);

            // 获取所有 NFT 的 tokenId 和 tokenURI
            const tokens = [];
            for (let i = 0; i < balanceNum; i++) {
                try {
                    const tokenId = await contract.methods.tokenOfOwnerByIndex(userAddress, i).call();
                    const tokenURI = await contract.methods.tokenURI(tokenId).call();
                    tokens.push({
                        tokenId: tokenId,
                        tokenURI: tokenURI
                    });
                } catch (error) {
                    console.error(`Error getting token ${i}:`, error);
                }
            }

            return {
                balance: balanceNum,
                tokens: tokens,
                type: 'ERC721'
            };
        } catch (error) {
            throw new Error(`Failed to get ERC721 balance: ${error.message}`);
        }
    }

    // 根据合约类型获取余额
    public async getTokenBalance(contractAddress: string, userAddress: string): Promise<any> {
        try {
            const contractType = await this.detectContractType(contractAddress);
            switch (contractType) {
                case 'ERC20':
                    return await this.getERC20Balance(contractAddress, userAddress);
                case 'ERC721':
                    return await this.getERC721Balance(contractAddress, userAddress);
                default:
                    throw new Error('Unknown contract type');
            }
        } catch (error) {
            throw error;
        }
    }
}