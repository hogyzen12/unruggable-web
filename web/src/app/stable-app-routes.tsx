import { useState, useEffect } from 'react';
import { Link, Navigate, useRoutes } from 'react-router-dom';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { getWalletBalance } from './utils/wallet';
import { createPaymentTx } from './transaction';
import { PublicKey } from '@solana/web3.js';

export function AppRoutes() {
  return useRoutes([
    { index: true, element: <Navigate replace to="/home" /> },
    { path: '/home', element: <Terminal /> },
    {
      path: '/page-1',
      element: (
        <div>
          <p>Page 1 content</p>
          <Link to="/home">Home</Link>
        </div>
      ),
    },
  ]);
}

function Terminal() {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const [command, setCommand] = useState('');
  const [output, setOutput] = useState<string[]>([]);
  const [balance, setBalance] = useState<number>(0);

  useEffect(() => {
    if (publicKey) {
      fetchWalletData();
    }
  }, [publicKey]);

  const fetchWalletData = async () => {
    try {
      if (publicKey) {
        const balance = await getWalletBalance(connection, publicKey);
        setBalance(balance);
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processCommand(command);
    setCommand('');
  };

  const processCommand = async (command: string) => {
    const commandOutput = `$ ${command}`;
    setOutput([...output, commandOutput]);
  
    const [cmd, amountStr, recipient] = command.split(' ');
  
    switch (cmd) {
      case 'pay':
        if (publicKey && signTransaction && amountStr && recipient) {
          try {
            const amount = parseFloat(amountStr);
            const txid = await createPaymentTx(amount, recipient, publicKey, signTransaction, connection);
            setOutput([...output, `Transaction submitted: ${txid}`]);
          } catch (error) {
            if (error instanceof Error) {
              setOutput([...output, `Error: ${error.message}`]);
            } else {
              setOutput([...output, 'Unknown error occurred']);
            }
          }
        } else {
          setOutput([...output, 'Invalid parameters. Usage: pay <amount> <recipient>']);
        }
        break;
      case '9':
        setOutput([...output, 'Wallet disconnected.']);
        break;
      default:
        setOutput([...output, 'Invalid command.']);
    }
  };

  const renderPrompt = () => {
    if (publicKey) {
      return `${publicKey.toBase58()}@unruggable.sh $`;
    } else {
      return 'anon@unruggable.sh $';
    }
  };

  return (
    <div className="terminal">
      <div className="terminal-output">
        {publicKey && (
          <>
            <p>Welcome to Unruggable</p>
            <p>Connected Wallet: {publicKey.toBase58()}</p>
            <p>Balance: {balance} SOL</p>
            <p>Options:</p>
            <p>9. Exit</p>
          </>
        )}
        {output.map((line, index) => (
          <p key={index}>{line}</p>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="terminal-input">
        <span>{renderPrompt()}</span>
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          autoFocus
        />
      </form>
    </div>
  );
}

export default Terminal;