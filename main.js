(() => {
	window.addEventListener('DOMContentLoaded', (event) => {
		let variableCount = 2;
		const variableCountSelection = document.getElementById('variableCount');
		const showStepsCheckbox = document.getElementById('showSteps');
		const equationsContainer = document.getElementById('equations');
		const calculateButton = document.getElementById('calculate');
		const solutionContainer = document.getElementById('solution');
		const appendToSolution = (textLine, appendNewLine= true) => {
			if (textLine && textLine.length > 0) {
				solutionContainer.appendChild(document.createTextNode(textLine));
			}
			if (appendNewLine) {
				solutionContainer.appendChild(document.createElement('br'));
			}
		};
		const appendMathToSolution = (mathString, appendNewLine = true) => {
			const div = document.createElement('div');
			katex.render(mathString, div, { throwOnError: false });
			solutionContainer.appendChild(div);
			if (appendNewLine) {
				solutionContainer.appendChild(document.createElement('br'));
			}
		};
		const matrixToMath = (matrix, rows, columns) => {
			let result = '\\begin{bmatrix}\n';
			for (let i = 0; i < rows; ++i) {
				for (let j = 0; j < columns - 1; ++j) {
					result += matrix[i * columns + j];
					result += ' & ';
				}
				result += matrix[i * columns + (columns - 1)];
				result += ' \\\\\n';
			}
			result += '\\end{bmatrix}';
			return result;
		};
		const SolutionStatusStrings = Object.freeze([ 'One Solution', 'Infinite solutions.', 'No solution.' ]);
		const SolutionStatus =  Object.freeze({ one: 0, infinite: 1, none: 2 });
		const findSolutionStatus = (det, varDets) => {
			if (det == 0) {
				if (varDets.every((v) => { return v == 0; })) {
					return SolutionStatus.infinite;
				} else {
					return SolutionStatus.none;
				}
			}
			return SolutionStatus.one;
		}
		/* One solution: 1 2 -11, -2 1 -13 */
		/* No solution: 3 1 9, 3 1 -7 */
		/* Infinite solutions: -6 4 2, 3 2 -1 */
		const calculateXYSolution = (coefficients, constants) => {
			const findDet = (m) => { return m[0] * m[3] - m[1] * m[2]; };
			const makeVarMatrix = (d, column, c) => {
				const result = Array.from(d);
				result[0 + (column - 1)] = c[0];
				result[2 + (column - 1)] = c[1];
				return result;
			};
			const det = findDet(coefficients);
			const xMatrix = makeVarMatrix(coefficients, 1, constants);
			const xDet = findDet(xMatrix);
			const yMatrix = makeVarMatrix(coefficients, 2, constants);
			const yDet = findDet(yMatrix);
			const status = findSolutionStatus(det, [ xDet, yDet ]);
			let x = null;
			let y = null;
			if (status == SolutionStatus.one) {
				x = xDet / det;
				y = yDet / det;
				appendToSolution('Solution: ');
				appendMathToSolution('x = ' + x + ', y = ' + y);
			} else {
				appendToSolution(SolutionStatusStrings[status]);
				appendToSolution(null);
			}
			if (showStepsCheckbox.checked) {
				appendToSolution('Steps: ', false);
				solutionContainer.appendChild(document.createElement('hr'));
				const generateDetMath = (matrix, varName, det) => {
					const matrixName = (varName && varName.length > 0 ?
						'D_' + varName : 'D');
					return '\\det ' + matrixName + ' \\\\\n' +
						' = {' + matrixName + '}_{1,1} {' + matrixName + '}_{2,2} - {' + matrixName + '}_{1,2} {' + matrixName + '}_{2,1} \\\\\n' +
						' = {' + matrix[0] + '} \\times {' + matrix[3] + '} - {' + matrix[1] + '} \\times {' + matrix[2] + '} \\\\\n' +
						' = {' + matrix[0] * matrix[3] + '} - {' + matrix[1] * matrix[2] + '} \\\\\n' +
						' = {' + det + '} \\\\[1em]\n';
				};
				appendMathToSolution(
					'D = ' + matrixToMath(coefficients, 2, 2) + ' \\, ' + 
					'C = ' + matrixToMath(constants, 2, 1) + ' \\\\[1em]\n' +
					generateDetMath(coefficients, null, det) + ' \\\\[1em]\n' +
					'D_x = ' + matrixToMath(xMatrix, 2, 2) + ' \\\\\n' +
					generateDetMath(xMatrix, 'x', xDet) +
					'D_y = ' + matrixToMath(yMatrix, 2, 2) + ' \\\\\n' +
					generateDetMath(yMatrix, 'y', yDet), false);
				if (status == SolutionStatus.one) {
					const generateVarMath = (varDet, det, varValue, varName) => {
						return varName + ' \\\\\n' +
							'= \\det D_' + varName + ' \\div \\det D \\\\\n' +
							'= {' + varDet + '} \\div {' + det + '} \\\\\n' +
							'= {' + varValue + '}';
					}
					appendMathToSolution(
						generateVarMath(xDet, det, x, 'x') + ' \\\\[1em]\n' +
						generateVarMath(yDet, det, y, 'y'), false)
				}
			}
		};
		/* One solution: 3 2 -1 6, -2 2 1 3, 1 1 1 4: 1 2 1 
		 * Infinite solutions: 2 1 -3 0, 4 2 -6 0, 1 -1 1 0
		 * No solution: 1 -3 1 4, -1 2 -5 3, 5 -13 13 8
		 */
		const calculateXYZSolution = (coefficients, constants) => {
			const findDet = (m) => { 
				return m[0] * m[4] * m[8] - 
					m[0] * m[5] * m[7] -
					m[1] * m[3] * m[8] +
					m[1] * m[5] * m[6] +
					m[2] * m[3] * m[7] -
					m[2] * m[4] * m[6];
			}
			const makeVarMatrix = (d, column, c) => {
				const result = Array.from(d);
				result[0 + (column - 1)] = c[0];
				result[3 + (column - 1)] = c[1];
				result[6 + (column - 1)] = c[2]; 
				return result;
			};
			const det = findDet(coefficients);
			const xMatrix = makeVarMatrix(coefficients, 1, constants);
			const xDet = findDet(xMatrix);
			const yMatrix = makeVarMatrix(coefficients, 2, constants);
			const yDet = findDet(yMatrix);
			const zMatrix = makeVarMatrix(coefficients, 3, constants);
			const zDet = findDet(zMatrix);
			const status = findSolutionStatus(det, [ xDet, yDet, zDet ]);
			let x = null;
			let y = null;
			let z = null;
			if (status == SolutionStatus.one) {
				x = xDet / det;
				y = yDet / det;
				z = zDet / det;
				appendToSolution('Solution: ');
				appendMathToSolution('x = ' + x + ', y = ' + y + ', z = ' + z);
			} else {
				appendToSolution(SolutionStatusStrings[status]);
				appendToSolution(null);
			}
			if (showStepsCheckbox.checked) {
				appendToSolution('Steps: ', false);
				solutionContainer.appendChild(document.createElement('hr'));
				const generateDetMath = (matrix, varName, det) => {
					const matrixName = (varName && varName.length > 0 ?
						'D_' + varName : 'D');
					return '\\det ' + matrixName + ' \\\\\n' +
						' = {' + matrixName + '}_{1, 1}({' + matrixName + '}_{2,2} {' + matrixName + '}_{3,3} - {' + matrixName + '}_{2,3} {' + matrixName + '}_{3,2}) - {' + matrixName + '}_{1,2}({' + matrixName + '}_{2,1} {' + matrixName + '}_{3,3} - {' + matrixName + '}_{2,3} {' + matrixName + '}_{3,1}) + {' + matrixName + '}_{1,3}({' + matrixName + '}_{2,1} {' + matrixName + '}_{3,2} - {' + matrixName + '}_{2,2} {' + matrixName + '}_{3,1}) \\\\\n' +
						' = {' + matrix[0] + '}({' + matrix[4] + '} \\times {' + matrix[8] + '} - {' + matrix[5] + '} \\times {' + matrix[7] + '}) - {' + matrix[1] + '}({' + matrix[3] + '} \\times {' + matrix[8] + '} - {' + matrix[5] + '} \\times {' + matrix[6] + '}) + {' + matrix[2] + '}({' + matrix[3] + '} \\times {' + matrix[7] + '} - {' + matrix[4] + '} \\times {' + matrix[6] + '}) \\\\\n' +
						' = {' + matrix[0] + '}({' + (matrix[4] * matrix[8]) + '} - {' + (matrix[5] * matrix[7]) + '}) - {' + matrix[1] + '}({' + (matrix[3] * matrix[8]) + '} - {' + (matrix[5] * matrix[6]) + '}) + {' + matrix[2] + '}({' + (matrix[3] * matrix[7]) + '} - {' + (matrix[4] * matrix[6]) + '}) \\\\\n' +
						' = {' + matrix[0] + '}({' + ((matrix[4] * matrix[8]) - (matrix[5] * matrix[7])) + '}) - {' + matrix[1] + '}({' + ((matrix[3] * matrix[8]) - (matrix[5] * matrix[6])) + '}) + {' + matrix[2] + '}({' + ((matrix[3] * matrix[7]) - (matrix[4] * matrix[6])) + '}) \\\\\n' +
						' = {' + (matrix[0] * ((matrix[4] * matrix[8]) - (matrix[5] * matrix[7]))) + '} - {' + (matrix[1] * ((matrix[3] * matrix[8]) - (matrix[5] * matrix[6]))) + '} + {' + (matrix[2] * ((matrix[3] * matrix[7]) - matrix[4] * matrix[6])) + '} \\\\\n' +
						' = {' + det + '} \\\\[1em]\n';
				};
				appendMathToSolution(
					'D = ' + matrixToMath(coefficients, 3, 3) + ' \\, ' + 
					'C = ' + matrixToMath(constants, 3, 1) + ' \\\\[1em]\n' +
					generateDetMath(coefficients, null, det) + ' \\\\[1em]\n' +
					'D_x = ' + matrixToMath(xMatrix, 3, 3) + ' \\\\\n' +
					generateDetMath(xMatrix, 'x', xDet) +
					'D_y = ' + matrixToMath(yMatrix, 3, 3) + ' \\\\\n' +
					generateDetMath(yMatrix, 'y', yDet) +
					'D_z = ' + matrixToMath(zMatrix, 3, 3) + ' \\\\\n' +
					generateDetMath(zMatrix, 'z', zDet), false);
				if (status == SolutionStatus.one) {
					const generateVarMath = (varDet, det, varValue, varName) => {
						return varName + ' \\\\\n' +
							'= \\det D_' + varName + ' \\div \\det D \\\\\n' +
							'= {' + varDet + '} \\div {' + det + '} \\\\\n' +
							'= {' + varValue + '}';
					}
					appendMathToSolution(
						generateVarMath(xDet, det, x, 'x') + ' \\\\[1em]\n' +
						generateVarMath(yDet, det, y, 'y') + ' \\\\[1em]\n' +
						generateVarMath(zDet, det, z, 'z'), false);
				}
			}
		};
		const makeEquationsFragment = (n) => {
			const fragment = document.createDocumentFragment();
			const div = document.createElement('div');
			const variableNames = [ 'x', 'y', 'z' ];
			let coef = 1;
			for (let i = 0; i < n; ++i) {
				for (let j = 0; j < n; ++j) {
					const input = document.createElement('input');
					input.id = 'coef' + coef++;
					input.type = 'text';
					/*
					 * input type number is basically not supported by any browsers except firefox.
					 * Why do people think chrome is the best browser? It's not. 
					input.type = 'number';
					*/
					div.appendChild(input);
					let operator = null;
					if (j == n - 1) {
						operator = ' = ';
					} else {
						operator = ' + ';
					}
					div.appendChild(document.createTextNode(variableNames[j] + 
							operator));
				}
				const constantInput = document.createElement('input');
				constantInput.id = 'const' + (i + 1);
				constantInput.type = 'text'; /*'number';*/
				div.appendChild(constantInput);
				div.appendChild(document.createElement('br'));
			}
			fragment.appendChild(div);
			return fragment;
		};
		const xyFragment = makeEquationsFragment(2);
		const xyzFragment = makeEquationsFragment(3);
		const changeVariableCount = (count) => {
			if (equations.lastChild) {
				equations.removeChild(equations.lastChild);
			}
			if (count == 2) {
				equations.appendChild(xyFragment.cloneNode(true));	
			} else if (count == 3) {
				equations.appendChild(xyzFragment.cloneNode(true));
			}
			const inputList = document.querySelectorAll('#equations input');
			for (let input of inputList) {
				input.addEventListener('click', (event) => {
					event.target.select();	
				});
			}
		};
		const updateVariableCount = () => {
			variableCount = Number(variableCountSelection.value);
			changeVariableCount(variableCount);
		};
		const calculateSolution = () => {
			while (solutionContainer.lastChild) {
				solutionContainer.removeChild(solutionContainer.lastChild);
			}
			const coefficients = [];
			const constants = [];
			for (let i = 0; i < variableCount * variableCount; ++i) {
				coefficients.push(Number(
						document.getElementById('coef' + (i + 1)).value));
			}
			for (let i = 0; i < variableCount; ++i) {
				constants.push(Number(
						document.getElementById('const' + (i + 1)).value));
			}
			if (variableCount == 2) {
				calculateXYSolution(coefficients, constants);
			} else if (variableCount == 3) {
				calculateXYZSolution(coefficients, constants);
			}
		};
		variableCountSelection.addEventListener('change', (event) => {
			updateVariableCount();
		});
		calculateButton.addEventListener('click', (event) => {
			calculateSolution();			
		});
		updateVariableCount();
	});
})();
